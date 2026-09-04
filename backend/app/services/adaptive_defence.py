"""
CHRONOS-WS Stage 12 Adaptive Defence Engine.
Synthesizes state inputs across:
- Telemetry predictions (Stage 7)
- MITRE attack paths (Stage 8)
- Threat risk levels (Stage 5 / Stage 8)
- Attacker objective probabilities (Stage 10)
- Asset risk & Load Balancer states (Stage 4)
- Defense-in-Depth Security Matrix (Stage 3)
- Strategic LLM Reasoning outputs (Stage 9)

Outputs validated DefenceDecision containing multiple simultaneous actions (PROTECT, MONITOR, DECEIVE)
validated through PolicyValidator guardrails.
"""

import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.models.schemas import (
    DefenceDecision,
    DefenceAction,
    DecisionEvidence,
    DecisionPolicy,
    DefenceCurrentResponse,
    DefenceHistoryResponse
)
from app.services.telemetry_pipeline import telemetry_pipeline
from app.services.attack_path_engine import attack_path_engine
from app.services.objective_inference import objective_engine
from app.services.security_matrix import security_matrix_engine
from app.services.load_balancer import load_balancer
from app.services.policy_validator import policy_validator

logger = logging.getLogger("CHRONOS-WS.AdaptiveDefence")


class AdaptiveDefenceEngine:
    def __init__(self, max_history_size: int = 100):
        self.max_history_size = max_history_size
        self.history: List[DefenceDecision] = []

    def compute_defence_decision(self) -> DefenceDecision:
        """
        Synthesizes multi-stage telemetry predictions, attack paths, and objective probabilities
        into validated, multi-action defensive decisions.
        """
        # 1. Gather Context Inputs
        latest_state = telemetry_pipeline.get_latest_state()
        attack_path_obj = attack_path_engine.analyze_attack_path()
        objectives_resp = objective_engine.get_current_objectives()
        sec_overview = security_matrix_engine.get_overview()
        lb_status = load_balancer.get_status()

        current_stage = attack_path_obj.prediction.current_stage
        next_stage = attack_path_obj.prediction.predicted_next_stage
        risk_level = attack_path_obj.prediction.risk
        confidence_score = attack_path_obj.prediction.confidence

        primary_obj = objectives_resp.primary_objective
        obj_map = {item.objective: item.current_probability for item in objectives_resp.objectives}
        cred_prob = obj_map.get("credentials", 0.33)
        db_prob = obj_map.get("database", 0.33)
        admin_prob = obj_map.get("administrative_access", 0.34)

        # 2. Extract Key Evidences
        evidences: List[DecisionEvidence] = [
            DecisionEvidence(
                feature="attack_path_stage",
                reason=f"Current attack progression stage evaluated as '{current_stage}' advancing to '{next_stage}'.",
                impact=risk_level
            ),
            DecisionEvidence(
                feature="objective_probability_distribution",
                reason=f"Attacker hypotheses: Credentials ({cred_prob:.1%}), Database ({db_prob:.1%}), Admin ({admin_prob:.1%}).",
                impact="HIGH" if max(cred_prob, db_prob, admin_prob) > 0.40 else "MEDIUM"
            ),
            DecisionEvidence(
                feature="security_matrix_health",
                reason=f"Defense-in-depth security overview: {sec_overview.healthy_layers}/{sec_overview.total_layers} layers healthy ({sec_overview.system_security_status}).",
                impact="LOW" if sec_overview.system_security_status == "PROTECTED" else "HIGH"
            ),
            DecisionEvidence(
                feature="load_balancer_routing",
                reason=f"Load balancer routing traffic across {len(lb_status.servers)} operational server nodes.",
                impact="MEDIUM"
            )
        ]

        # 3. Generate Multiple Simultaneous Actions per Target Asset
        actions: List[DefenceAction] = []

        # Target 1: Authentication Service (auth_service_01)
        auth_actions = ["PROTECT", "MONITOR"] if cred_prob > 0.30 or "Credential" in current_stage else ["PROTECT"]
        actions.append(DefenceAction(
            target_asset="auth_service_01",
            actions=auth_actions,
            primary_action="PROTECT",
            rationale=f"High credential objective ({cred_prob:.1%}) & attack stage '{current_stage}' warrant simultaneous rate limiting (PROTECT) and step-up MFA log analysis (MONITOR)."
        ))

        # Target 2: Primary Database (db_primary_01)
        db_actions = ["PROTECT", "MONITOR"] if db_prob > 0.30 or "Collection" in next_stage else ["PROTECT"]
        actions.append(DefenceAction(
            target_asset="db_primary_01",
            actions=db_actions,
            primary_action="PROTECT",
            rationale=f"Real production database retains mandatory isolation (PROTECT) with deep query verbosity inspection (MONITOR) driven by DB exfiltration probability ({db_prob:.1%})."
        ))

        # Target 3: Decoy Honeypot Database (decoy_db_01)
        decoy_actions = ["DECEIVE", "MONITOR"]
        actions.append(DefenceAction(
            target_asset="decoy_db_01",
            actions=decoy_actions,
            primary_action="DECEIVE",
            rationale="High-interaction synthetic database decoy deployed to trap exfiltration attempts (DECEIVE) with real-time session capture (MONITOR)."
        ))

        # Target 4: Administrative Portal (admin_portal_01)
        admin_actions = ["PROTECT", "MONITOR"] if admin_prob > 0.35 or "Lateral" in current_stage else ["MONITOR"]
        if "PROTECT" not in admin_actions:
            admin_actions.insert(0, "PROTECT")  # Ensure real production asset safety rule
        actions.append(DefenceAction(
            target_asset="admin_portal_01",
            actions=admin_actions,
            primary_action="PROTECT",
            rationale=f"Administrative access objective ({admin_prob:.1%}) warrants strict IP access control (PROTECT) and privileged session tracking (MONITOR)."
        ))

        # 4. Construct Decision Object
        decision_id = f"DEC-{uuid.uuid4().hex[:8].upper()}"
        recommendation_str = f"Enforce simultaneous [PROTECT + MONITOR] on auth_service_01 and [DECEIVE + MONITOR] on decoy_db_01."

        raw_decision = DefenceDecision(
            decision_id=decision_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            overall_risk=risk_level,
            confidence=confidence_score,
            actions=actions,
            evidences=evidences,
            llm_recommendation=recommendation_str,
            policy_approved=True,
            validated_by_policy_engine=True
        )

        # 5. Run Decision Through Policy Engine Validator
        validated_decision = policy_validator.validate_defence_decision(raw_decision)

        # Stage 13 Integration Trigger: DECEIVE action causes controlled decoy service to activate
        if validated_decision.policy_approved:
            has_deceive_action = any("DECEIVE" in [act.upper() for act in action_item.actions] for action_item in validated_decision.actions)
            if has_deceive_action:
                try:
                    from app.services.deception_engine import deception_engine
                    deception_engine.activate_deception(policy_validated=True)
                except Exception as e:
                    logger.warning(f"Could not auto-activate deception engine: {e}")

        # 6. Store History
        self.history.append(validated_decision)
        if len(self.history) > self.max_history_size:
            self.history.pop(0)

        return validated_decision

    def get_current_decision(self) -> DefenceCurrentResponse:
        """Returns current validated adaptive defence decision."""
        decision = self.compute_defence_decision()
        return DefenceCurrentResponse(
            timestamp=datetime.now(timezone.utc).isoformat(),
            decision=decision
        )

    def get_defence_history(self) -> DefenceHistoryResponse:
        """Returns historical sequence of adaptive defence decisions."""
        if not self.history:
            self.compute_defence_decision()
        return DefenceHistoryResponse(
            timestamp=datetime.now(timezone.utc).isoformat(),
            total_decisions=len(self.history),
            history=self.history
        )


# Global Singleton Instance
adaptive_defence_engine = AdaptiveDefenceEngine()
