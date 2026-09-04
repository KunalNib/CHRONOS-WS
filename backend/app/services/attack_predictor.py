"""
Attack Path Prediction Engine & MITRE ATT&CK Mapping.
Converts NetworkState S_t and predicted state S_{t+1} into graph attack progression and choke points.
"""

from typing import List
from app.models.schemas import NetworkState, AttackPathForecast, AttackPathHop, MitreTechnique

class AttackPredictor:
    def __init__(self):
        pass

    def forecast_attack_path(self, current_state: NetworkState, predicted_state: NetworkState) -> AttackPathForecast:
        """
        Evaluates current & predicted network metrics to infer attack progression hops across enterprise nodes:
        [Perimeter Router] ➔ [Web-Server-01] ➔ [API-Gateway] ➔ [Crown-Jewel DB / Decoy DB]
        """
        risk = predicted_state.security_risk
        failed_logins = current_state.failed_login_count + predicted_state.failed_login_count
        db_rate = current_state.database_query_rate + predicted_state.database_query_rate

        hops: List[AttackPathHop] = []

        # Step 1: Perimeter Entry
        hops.append(AttackPathHop(
            step=1,
            source_node="External Internet",
            target_node="Perimeter Router",
            probability=1.0,
            mitre_info=MitreTechnique(
                tactic="Reconnaissance",
                technique_id="T1595",
                technique_name="Active Scanning",
                confidence=0.95
            ),
            status="HISTORICAL"
        ))

        # Step 2: Web Server Compromise / Authentication Spray
        web_prob = min(0.99, 0.40 + (failed_logins * 0.05) + (risk * 0.3))
        hops.append(AttackPathHop(
            step=2,
            source_node="Perimeter Router",
            target_node="Web-Server-01",
            probability=web_prob,
            mitre_info=MitreTechnique(
                tactic="Credential Access",
                technique_id="T1110",
                technique_name="Brute Force / Password Spraying",
                confidence=min(0.98, 0.5 + (failed_logins * 0.06))
            ),
            status="CURRENT_LOCATION" if risk > 0.3 else "HISTORICAL"
        ))

        # Step 3: API Gateway & Privilege Escalation
        api_prob = min(0.95, web_prob * (0.5 + risk * 0.4))
        hops.append(AttackPathHop(
            step=3,
            source_node="Web-Server-01",
            target_node="API-Gateway",
            probability=api_prob,
            mitre_info=MitreTechnique(
                tactic="Lateral Movement",
                technique_id="T1078",
                technique_name="Valid Accounts / Token Abuse",
                confidence=0.85
            ),
            status="PREDICTED_NEXT" if risk > 0.4 else "PREDICTED_NEXT"
        ))

        # Step 4: Crown-Jewel Database Exfiltration Target
        db_prob = min(0.95, api_prob * (0.4 + (db_rate * 0.02) + (risk * 0.5)))
        hops.append(AttackPathHop(
            step=4,
            source_node="API-Gateway",
            target_node="PostgreSQL-CrownJewel",
            probability=db_prob,
            mitre_info=MitreTechnique(
                tactic="Exfiltration",
                technique_id="T1048",
                technique_name="Exfiltration Over Alternative Protocol",
                confidence=0.90
            ),
            status="PREDICTED_NEXT"
        ))

        # Identify key choke point node
        choke_point = "API-Gateway" if risk < 0.6 else "Web-Server-01"
        est_time = max(15, int(180 - (risk * 150)))

        return AttackPathForecast(
            predicted_path=hops,
            choke_point_node=choke_point,
            estimated_time_to_compromise_sec=est_time,
            overall_confidence=float(min(0.99, 0.70 + risk * 0.28))
        )

attack_predictor = AttackPredictor()
