"""
CHRONOS-WS Stage 8 Attack-Path Prediction Engine.
Correlates:
1. Current NetworkState (S_t)
2. Predicted Future NetworkState (S_t+1 from Stage 7 LSTM World Model)
3. Recent Telemetry Event stream
4. Security Layer status & Asset topology
To forecast attack progression across MITRE ATT&CK tactics (Discovery -> Initial Access -> Credential Access -> Lateral Movement -> Collection/Exfiltration).
"""

import os
import sys
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple, Optional

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from app.models.schemas import (
    NetworkState,
    AttackPathNode,
    AttackPathEdge,
    AttackStagePrediction,
    AttackPath
)
from app.services.telemetry_pipeline import telemetry_pipeline
from ml.inference import TemporalInferenceEngine


class AttackPathPredictionEngine:
    """
    Service Engine for predicting attack paths and stage progressions.
    Derives graph nodes, edges, and future predictions dynamically from backend state & ML predictions.
    """
    def __init__(self):
        checkpoint_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'checkpoints', 'world_model.pth'))
        self.inference_engine = TemporalInferenceEngine(checkpoint_path=checkpoint_path)

    def analyze_attack_path(self) -> AttackPath:
        """
        Executes dynamic attack path generation and prediction:
        1. Fetches recent NetworkStates and raw telemetry from pipeline.
        2. Calls Stage 7 LSTM inference to obtain predicted next state S_t+1.
        3. Maps evidence to MITRE ATT&CK tactics & techniques.
        4. Builds AttackPath object with nodes, edges, and prediction header.
        """
        # 1. Fetch current network states
        recent_states = telemetry_pipeline.get_state_history(limit=15).states
        
        if not recent_states:
            # Fallback state if pipeline warm-up is in progress
            current_state = NetworkState(state_id="S_init", time_step=1, security_risk=0.15)
            recent_states = [current_state]
        else:
            current_state = recent_states[-1]

        # 2. Get LSTM World Model Prediction for S_t+1
        predicted_state, lstm_conf, model_tag = self.inference_engine.predict_next_state(recent_states)

        # 3. Analyze risk levels & recent telemetry events
        cur_risk = current_state.security_risk
        pred_risk = predicted_state.security_risk
        recent_telemetry = telemetry_pipeline.get_recent_events(limit=50)

        # Count suspicious events
        scan_events = sum(1 for e in recent_telemetry if "PORT_SCAN" in e.event_type or "TRAFFIC" in e.event_type)
        auth_events = sum(1 for e in recent_telemetry if "LOGIN" in e.event_type or e.features.get("failed_login", 0) > 0)
        db_events = sum(1 for e in recent_telemetry if "DB" in e.event_type or "SQL" in str(e.metadata))

        # 4. Dynamic MITRE ATT&CK Stage Determination
        # Stages: Reconnaissance/Discovery -> Initial Access -> Credential Access -> Lateral Movement -> Collection/Exfiltration
        if pred_risk > 0.65 or db_events > 3:
            cur_stage_name = "Credential Access"
            next_stage_name = "Lateral Movement"
            fut_stages = ["Collection & Exfiltration", "Impact / Ransomware"]
            active_node_id = "node_cred"
            overall_risk = "CRITICAL" if pred_risk > 0.8 else "HIGH"
        elif pred_risk > 0.35 or auth_events > 2:
            cur_stage_name = "Initial Access"
            next_stage_name = "Credential Access"
            fut_stages = ["Lateral Movement", "Collection & Exfiltration"]
            active_node_id = "node_init"
            overall_risk = "HIGH" if pred_risk > 0.5 else "ELEVATED"
        elif pred_risk > 0.15 or scan_events > 5:
            cur_stage_name = "Discovery"
            next_stage_name = "Initial Access"
            fut_stages = ["Credential Access", "Lateral Movement", "Collection & Exfiltration"]
            active_node_id = "node_disc"
            overall_risk = "ELEVATED"
        else:
            cur_stage_name = "Reconnaissance"
            next_stage_name = "Discovery"
            fut_stages = ["Initial Access", "Credential Access", "Lateral Movement"]
            active_node_id = "node_recon"
            overall_risk = "LOW"

        # Define 5 MITRE progression nodes
        nodes_def = [
            ("node_recon", "Discovery / Recon", "TA0043: Reconnaissance", "T1595: Active Scanning", "edge_firewall_01", cur_risk * 0.5, max(1, scan_events)),
            ("node_disc", "Discovery", "TA0007: Discovery", "T1046: Network Service Discovery", "load_balancer_01", max(0.15, cur_risk * 0.8), max(2, scan_events)),
            ("node_init", "Initial Access", "TA0001: Initial Access", "T1190: Exploit Public-Facing Application", "web_server_01", max(0.25, pred_risk * 0.9), max(1, auth_events)),
            ("node_cred", "Credential Access", "TA0006: Credential Access", "T1110: Brute Force", "auth_service_01", max(0.40, pred_risk * 0.95), max(1, auth_events)),
            ("node_lat", "Lateral Movement", "TA0008: Lateral Movement", "T1021: Remote Services", "database_01", max(0.50, pred_risk), max(1, db_events)),
            ("node_exfil", "Collection & Exfiltration", "TA0010: Exfiltration", "T1041: Exfiltration Over C2", "backup_storage_01", pred_risk, max(1, db_events))
        ]

        node_id_order = [n[0] for n in nodes_def]
        active_idx = node_id_order.index(active_node_id) if active_node_id in node_id_order else 1

        path_nodes: List[AttackPathNode] = []
        for idx, (n_id, label, tactic, tech, asset, r_score, ev_cnt) in enumerate(nodes_def):
            if idx < active_idx:
                status = "COMPLETED"
            elif idx == active_idx:
                status = "ACTIVE"
            elif idx == active_idx + 1:
                status = "PREDICTED"
            else:
                status = "POTENTIAL"

            path_nodes.append(
                AttackPathNode(
                    id=n_id,
                    label=label,
                    tactic=tactic,
                    technique=tech,
                    status=status,
                    asset_id=asset,
                    risk_score=round(r_score, 3),
                    evidence_count=ev_cnt
                )
            )

        # Build Edges between nodes
        path_edges: List[AttackPathEdge] = []
        edge_probs = [0.95, 0.88, 0.82, 0.75, 0.65]
        for i in range(len(node_id_order) - 1):
            src_id = node_id_order[i]
            tgt_id = node_id_order[i + 1]
            prob = edge_probs[i] if i < len(edge_probs) else 0.50
            if i < active_idx:
                prob = 1.0  # Already completed transition
            elif i == active_idx:
                prob = round(float(lstm_conf), 2)  # LSTM prediction confidence for next transition

            path_edges.append(
                AttackPathEdge(
                    source=src_id,
                    target=tgt_id,
                    label=f"{nodes_def[i][1]} → {nodes_def[i+1][1]}",
                    probability=prob
                )
            )

        # Build Affected Assets List
        affected = ["edge_firewall_01", "load_balancer_01"]
        if pred_risk > 0.2:
            affected.append("web_server_01")
        if pred_risk > 0.4:
            affected.append("auth_service_01")
        if pred_risk > 0.6:
            affected.append("database_01")

        prediction_header = AttackStagePrediction(
            current_stage=cur_stage_name,
            predicted_next_stage=next_stage_name,
            future_stages=fut_stages,
            confidence=round(float(lstm_conf), 4),
            risk=overall_risk,
            affected_assets=affected,
            model_version=model_tag
        )

        return AttackPath(
            path_id=f"path_seq_{current_state.transition_sequence}",
            generated_at=datetime.now(timezone.utc).isoformat(),
            nodes=path_nodes,
            edges=path_edges,
            prediction=prediction_header,
            mitre_tactics_covered=["TA0043", "TA0007", "TA0001", "TA0006", "TA0008", "TA0010"]
        )


# Global Singleton Instance
attack_path_engine = AttackPathPredictionEngine()
