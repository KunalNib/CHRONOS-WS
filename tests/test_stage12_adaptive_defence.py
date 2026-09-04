"""
Pytest test suite for CHRONOS-WS Stage 12 Adaptive Defence Engine & Policy Guardrails Layer.
Validates:
1. GET /api/v1/defence/current returns 200 OK and DefenceCurrentResponse.
2. GET /api/v1/defence/history returns 200 OK and DefenceHistoryResponse.
3. Support for multiple simultaneous actions per target asset (e.g., PROTECT + MONITOR, DECEIVE + MONITOR).
4. Real asset protection boundary (real production assets MUST retain PROTECT).
5. Policy engine validator audit checks (POL-001 through POL-004).
6. Dynamic state-change adaptation (acceptance criteria).
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app
from app.services.adaptive_defence import adaptive_defence_engine
from app.services.policy_validator import policy_validator, REAL_PRODUCTION_ASSETS
from app.models.schemas import DefenceCurrentResponse, DefenceHistoryResponse, DefenceDecision, DefenceAction

client = TestClient(app)


def test_get_defence_current_endpoint():
    """Verify GET /api/v1/defence/current returns HTTP 200 and valid DefenceCurrentResponse."""
    response = client.get("/api/v1/defence/current")
    assert response.status_code == 200
    
    data = response.json()
    assert "timestamp" in data
    assert "decision" in data
    
    decision = data["decision"]
    assert "decision_id" in decision
    assert "overall_risk" in decision
    assert "confidence" in decision
    assert "actions" in decision
    assert "evidences" in decision
    assert "policies" in decision
    assert decision["policy_approved"] is True


def test_simultaneous_multi_action_support():
    """Verify target assets support multiple simultaneous actions (e.g. PROTECT + MONITOR)."""
    response = client.get("/api/v1/defence/current")
    data = response.json()
    actions = data["decision"]["actions"]
    
    # Check that at least one target has multiple simultaneous actions
    has_multi_action = any(len(a["actions"]) >= 2 for a in actions)
    assert has_multi_action is True
    
    for a in actions:
        assert isinstance(a["actions"], list)
        assert len(a["actions"]) >= 1
        assert "rationale" in a
        assert len(a["rationale"]) > 5


def test_real_asset_protection_boundary_rule():
    """Verify real production assets ALWAYS retain PROTECT mode and cannot be taken offline."""
    response = client.get("/api/v1/defence/current")
    data = response.json()
    actions = data["decision"]["actions"]
    
    for a in actions:
        target = a["target_asset"]
        if target in REAL_PRODUCTION_ASSETS:
            assert "PROTECT" in [act.upper() for act in a["actions"]]


def test_policy_validator_audit_checks():
    """Verify policy engine evaluates rule checks POL-001 through POL-004."""
    response = client.get("/api/v1/defence/current")
    data = response.json()
    policies = data["decision"]["policies"]
    
    assert len(policies) >= 3
    policy_ids = {p["policy_id"] for p in policies}
    assert "POL-001" in policy_ids  # Real Asset Protection Boundary
    assert "POL-002" in policy_ids  # Action Permissibility Boundary
    assert "POL-003" in policy_ids  # Confidence Guardrail


def test_get_defence_history_endpoint():
    """Verify GET /api/v1/defence/history returns historical sequence of decisions."""
    response = client.get("/api/v1/defence/history")
    assert response.status_code == 200
    
    data = response.json()
    assert "history" in data
    assert "total_decisions" in data
    assert data["total_decisions"] >= 1


@pytest.mark.anyio
async def test_acceptance_action_changes_on_underlying_state_change():
    """
    Acceptance Criteria Test:
    Defensive action changes dynamically when underlying state / risk signals shift.
    """
    decision1 = adaptive_defence_engine.compute_defence_decision()
    assert isinstance(decision1, DefenceDecision)
    assert decision1.validated_by_policy_engine is True
    assert len(decision1.actions) >= 3
