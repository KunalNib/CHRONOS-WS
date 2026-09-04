"""
CHRONOS-WS Stage 12 Policy Validator & Defensive Guardrails Layer.
Validates proposed defensive decisions against platform security policies before execution.
Ensures:
1. Real production assets are ALWAYS protected and NEVER disabled.
2. Actions belong to permitted set (PROTECT, MONITOR, DECEIVE).
3. Minimum confidence thresholds are satisfied.
4. Multiple simultaneous actions (e.g. PROTECT + MONITOR, DECEIVE + MONITOR) are compatible.
"""

import logging
from typing import List, Tuple
from app.models.schemas import (
    LLMReasoningOutput,
    DefenseInDepthStatus,
    DefenceDecision,
    DefenceAction,
    DecisionPolicy
)

logger = logging.getLogger("CHRONOS-WS.PolicyValidator")

ALLOWED_ACTIONS = {"PROTECT", "MONITOR", "DECEIVE"}
REAL_PRODUCTION_ASSETS = {"auth_service_01", "db_primary_01", "web_server_01", "core_db_01", "admin_portal_01"}
MIN_CONFIDENCE_THRESHOLD = 0.40


class PolicyValidator:
    def __init__(self):
        pass

    def validate_defence_decision(self, decision: DefenceDecision) -> DefenceDecision:
        """
        Validates full Stage 12 DefenceDecision against active policy guardrails.
        Updates decision.policies and sets decision.policy_approved flag.
        """
        policies: List[DecisionPolicy] = []
        overall_approved = True

        # Policy Rule 1: Real Asset Protection Boundary
        real_asset_protected = True
        violated_assets: List[str] = []

        for action in decision.actions:
            target = action.target_asset
            actions_list = [a.upper() for a in action.actions]

            # If target is a real production asset, it MUST retain "PROTECT"
            if target in REAL_PRODUCTION_ASSETS:
                if "PROTECT" not in actions_list:
                    real_asset_protected = False
                    violated_assets.append(target)
                    # Automatically enforce policy override: inject PROTECT
                    action.actions.insert(0, "PROTECT")
                    action.primary_action = "PROTECT"
                    action.rationale += " [POLICY OVERRIDE: Enforced mandatory PROTECT on real production asset]."

        policies.append(DecisionPolicy(
            policy_id="POL-001",
            policy_name="Real Production Asset Protection Boundary",
            passed=real_asset_protected,
            rule_description="Real production core infrastructure must ALWAYS retain PROTECT mode and cannot be taken offline."
        ))

        # Policy Rule 2: Permitted Defensive Action Set
        action_set_valid = True
        for action in decision.actions:
            for act in action.actions:
                if act.upper() not in ALLOWED_ACTIONS:
                    action_set_valid = False
                    logger.warning(f"[POLICY VIOLATION] Action '{act}' on target '{action.target_asset}' is not permitted.")

        policies.append(DecisionPolicy(
            policy_id="POL-002",
            policy_name="Defensive Action Permissibility Boundary",
            passed=action_set_valid,
            rule_description="Defensive actions must strictly belong to the allowed operational set {PROTECT, MONITOR, DECEIVE}."
        ))

        # Policy Rule 3: Minimum Model Confidence Threshold
        confidence_passed = decision.confidence >= MIN_CONFIDENCE_THRESHOLD
        if not confidence_passed:
            logger.warning(f"[POLICY WARNING] Decision confidence ({decision.confidence}) below threshold ({MIN_CONFIDENCE_THRESHOLD}).")
            # Override non-protected targets to MONITOR
            for action in decision.actions:
                if "PROTECT" not in [a.upper() for a in action.actions]:
                    action.actions = ["MONITOR"]
                    action.primary_action = "MONITOR"
                    action.rationale += f" [POLICY OVERRIDE: Low confidence ({decision.confidence:.2f}) defaulted to MONITOR]."

        policies.append(DecisionPolicy(
            policy_id="POL-003",
            policy_name="Minimum Confidence Threshold Guardrail",
            passed=confidence_passed,
            rule_description=f"Automated defensive decisions must satisfy minimum confidence threshold >= {MIN_CONFIDENCE_THRESHOLD:.2f}."
        ))

        # Policy Rule 4: Multi-Action Compatibility & Deception Boundary
        deception_valid = True
        for action in decision.actions:
            actions_list = [a.upper() for a in action.actions]
            if "DECEIVE" in actions_list and "MONITOR" not in actions_list:
                # Decoy deception SHOULD always include monitoring
                action.actions.append("MONITOR")

        policies.append(DecisionPolicy(
            policy_id="POL-004",
            policy_name="Multi-Action Compatibility & Deception Boundary",
            passed=deception_valid,
            rule_description="Deception operations (DECEIVE) must be coupled with active payload monitoring (MONITOR)."
        ))

        # Overall Approval Status
        overall_approved = all(p.passed for p in policies)
        decision.policies = policies
        decision.policy_approved = overall_approved
        decision.validated_by_policy_engine = True

        return decision

    def validate_action(
        self,
        llm_output: LLMReasoningOutput,
        security_matrix: DefenseInDepthStatus
    ) -> LLMReasoningOutput:
        """Legacy helper for Stage 9 backwards compatibility."""
        proposed = llm_output.recommended_action.upper()
        if proposed not in ALLOWED_ACTIONS:
            llm_output.policy_validation_passed = False
            llm_output.validated_action = "MONITOR"
            return llm_output

        if llm_output.confidence_score < MIN_CONFIDENCE_THRESHOLD:
            llm_output.policy_validation_passed = False
            llm_output.validated_action = "MONITOR"
            return llm_output

        llm_output.policy_validation_passed = True
        llm_output.validated_action = proposed
        return llm_output


policy_validator = PolicyValidator()
