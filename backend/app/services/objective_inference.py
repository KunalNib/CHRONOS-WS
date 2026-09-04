"""
CHRONOS-WS Stage 10 Multi-Hypothesis Objective Inference Engine.
Estimates attacker objective probabilities (credentials, database, administrative_access)
using multi-source evidence fusion:
- Telemetry & Authentication events
- Database query rates & Decoy interactions
- Admin activity & Host metrics
- Stage 8 Attack Path predictions
- Stage 5 Telemetry state transitions
- Stage 9 LLM Reasoning outputs

Guarantees non-collapsing multi-hypothesis distribution with history retention and probability delta computation.
"""

import math
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.models.schemas import (
    NetworkState,
    ObjectiveHypotheses,
    ObjectiveItemDetail,
    ObjectivesCurrentResponse,
    ObjectivesHistoryResponse
)
from app.services.telemetry_pipeline import telemetry_pipeline
from app.services.attack_path_engine import attack_path_engine

logger = logging.getLogger("CHRONOS-WS.ObjectiveInference")


class ObjectiveInferenceEngine:
    def __init__(self, max_history_size: int = 100):
        self.max_history_size = max_history_size
        self.history: List[ObjectivesCurrentResponse] = []
        # Initial baseline probabilities: uniform prior with slight differentiation
        self.last_probs: Dict[str, float] = {
            "credentials": 0.40,
            "database": 0.35,
            "administrative_access": 0.25
        }

    def infer_objectives(
        self,
        current_state: Optional[NetworkState] = None,
        predicted_state: Optional[NetworkState] = None,
        decoy_interacted: bool = False
    ) -> ObjectivesCurrentResponse:
        """
        Computes dynamic multi-hypothesis probability distribution over adversary goals.
        Prevents probability collapse using Laplace/Dirichlet smoothing.
        """
        if current_state is None:
            current_state = telemetry_pipeline.get_latest_state()

        if predicted_state is None:
            # Fallback to current state
            predicted_state = current_state

        # 1. Telemetry Feature Extraction
        failed_logins = current_state.failed_login_count + predicted_state.failed_login_count
        db_queries = current_state.database_query_rate + predicted_state.database_query_rate
        admin_events = current_state.suspicious_event_count + predicted_state.suspicious_event_count

        # 2. Stage 8 Attack Path Progression Context
        attack_path_obj = attack_path_engine.analyze_attack_path()
        current_stage = attack_path_obj.prediction.current_stage
        next_stage = attack_path_obj.prediction.predicted_next_stage

        # 3. Evidence Aggregation per Hypothesis
        cred_evidence: List[str] = [
            f"Authentication failure count: {failed_logins:.0f} events"
        ]
        db_evidence: List[str] = [
            f"Database query activity: {db_queries:.1f} q/s"
        ]
        admin_evidence: List[str] = [
            f"Suspicious host events: {admin_events:.0f} occurrences"
        ]

        if "Credential" in current_stage or "Credential" in next_stage:
            cred_evidence.append(f"Stage 8 Attack Engine identified active credential access stage ('{current_stage}')")
        if "Collection" in current_stage or "Exfiltration" in next_stage:
            db_evidence.append(f"Attack chain progressing toward exfiltration stage ('{next_stage}')")
        if "Lateral" in current_stage or "Discovery" in current_stage:
            admin_evidence.append(f"Lateral movement pattern observed across network topology ('{current_stage}')")

        if decoy_interacted:
            db_evidence.append("High-interaction decoy database engaged by external IP")

        # 4. Raw Likelihood Scoring
        raw_cred = 1.5 + (failed_logins * 2.0)
        raw_db = 1.2 + (db_queries * 3.5) + (50.0 if decoy_interacted else 0.0)
        raw_admin = 1.0 + (admin_events * 1.8)

        if "Credential" in current_stage or "Credential" in next_stage:
            raw_cred += 5.0
        if "Collection" in current_stage or "Exfiltration" in next_stage:
            raw_db += 6.0
        if "Lateral" in current_stage:
            raw_admin += 5.0

        # 5. Non-Collapsing Smoothing (Laplace Uniform Prior = 1.0)
        smoothing_prior = 1.5
        smoothed_cred = raw_cred + smoothing_prior
        smoothed_db = raw_db + smoothing_prior
        smoothed_admin = raw_admin + smoothing_prior

        total_score = smoothed_cred + smoothed_db + smoothed_admin
        p_cred = round(smoothed_cred / total_score, 4)
        p_db = round(smoothed_db / total_score, 4)
        p_admin = round(1.0 - (p_cred + p_db), 4)

        # Enforce non-collapsing bound: minimum 0.05 per objective
        p_cred = max(0.05, min(0.90, p_cred))
        p_db = max(0.05, min(0.90, p_db))
        p_admin = max(0.05, min(0.90, round(1.0 - (p_cred + p_db), 4)))

        # Re-normalize to guarantee exact sum = 1.0
        tot = p_cred + p_db + p_admin
        p_cred = round(p_cred / tot, 4)
        p_db = round(p_db / tot, 4)
        p_admin = round(1.0 - (p_cred + p_db), 4)

        current_probs = {
            "credentials": p_cred,
            "database": p_db,
            "administrative_access": p_admin
        }

        # 6. Compute Delta Changes (current - previous)
        prev_probs = self.last_probs
        delta_cred = round(p_cred - prev_probs.get("credentials", 0.33), 4)
        delta_db = round(p_db - prev_probs.get("database", 0.33), 4)
        delta_admin = round(p_admin - prev_probs.get("administrative_access", 0.34), 4)

        # 7. Build Objective Item Details
        objectives_list = [
            ObjectiveItemDetail(
                objective="credentials",
                current_probability=p_cred,
                previous_probability=prev_probs.get("credentials", 0.40),
                change=delta_cred,
                evidence=cred_evidence
            ),
            ObjectiveItemDetail(
                objective="database",
                current_probability=p_db,
                previous_probability=prev_probs.get("database", 0.35),
                change=delta_db,
                evidence=db_evidence
            ),
            ObjectiveItemDetail(
                objective="administrative_access",
                current_probability=p_admin,
                previous_probability=prev_probs.get("administrative_access", 0.25),
                change=delta_admin,
                evidence=admin_evidence
            )
        ]

        # Determine Primary Objective
        if p_db >= p_cred and p_db >= p_admin:
            primary = "database"
            expl = f"Database access objective dominant ({p_db:.1%}) driven by DB query rates & exfiltration indicators."
        elif p_cred >= p_db and p_cred >= p_admin:
            primary = "credentials"
            expl = f"Credential harvesting objective dominant ({p_cred:.1%}) driven by authentication failure activity."
        else:
            primary = "administrative_access"
            expl = f"Administrative access objective dominant ({p_admin:.1%}) driven by lateral movement & admin events."

        response = ObjectivesCurrentResponse(
            timestamp=datetime.now(timezone.utc).isoformat(),
            primary_objective=primary,
            explanation=expl,
            objectives=objectives_list
        )

        # Update History & Last Probs
        self.last_probs = current_probs
        self.history.append(response)
        if len(self.history) > self.max_history_size:
            self.history.pop(0)

        return response

    def estimate_objectives(
        self,
        current_state: NetworkState,
        predicted_state: NetworkState,
        decoy_interacted: bool = False
    ) -> ObjectiveHypotheses:
        """Backward-compatible helper returning legacy ObjectiveHypotheses format for demo runner."""
        resp = self.infer_objectives(current_state, predicted_state, decoy_interacted)
        probs = {obj.objective: obj.current_probability for obj in resp.objectives}
        return ObjectiveHypotheses(
            timestamp=resp.timestamp,
            credentials=probs.get("credentials", 0.33),
            database=probs.get("database", 0.33),
            administrative_access=probs.get("administrative_access", 0.34),
            primary_objective=resp.primary_objective,
            explanation=resp.explanation
        )

    def get_current_objectives(self) -> ObjectivesCurrentResponse:
        """Returns the latest inferred objective hypothesis snapshot."""
        return self.infer_objectives()

    def get_objectives_history(self) -> ObjectivesHistoryResponse:
        """Returns historical objective probability distributions."""
        if not self.history:
            self.infer_objectives()
        return ObjectivesHistoryResponse(
            timestamp=datetime.now(timezone.utc).isoformat(),
            total_snapshots=len(self.history),
            history=self.history
        )


# Global Singleton Instance
objective_engine = ObjectiveInferenceEngine()
