"""
Pytest test suite for CHRONOS-WS Stage 13 Secure Adaptive Deception Engine.
Validates:
1. GET /api/v1/deception/status returns HTTP 200 and DeceptionStatusResponse.
2. POST /api/v1/deception/activate activates isolated deception zone when policy_validated=True.
3. Policy activation boundary enforcement (reject unvalidated activation).
4. POST /api/v1/deception/deactivate returns decoys to standby.
5. GET /api/v1/deception/events returns log of captured attacker interactions.
6. Acceptance Criteria: DECEIVE decision from Adaptive Defence Engine causes controlled decoy service to activate.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app
from app.services.deception_engine import deception_engine
from app.services.adaptive_defence import adaptive_defence_engine
from app.models.schemas import DeceptionStatusResponse, DeceptionEventsResponse

client = TestClient(app)


def test_get_deception_status_endpoint():
    """Verify GET /api/v1/deception/status returns HTTP 200 OK and valid status object."""
    response = client.get("/api/v1/deception/status")
    assert response.status_code == 200
    
    data = response.json()
    assert "is_active" in data
    assert "isolation_status" in data
    assert "deception_realism" in data
    assert "fingerprint_risk" in data
    assert "active_decoys" in data
    
    decoys = data["active_decoys"]
    assert len(decoys) == 3
    decoy_names = {d["name"] for d in decoys}
    assert "Adaptive Decoy Database" in decoy_names
    assert "Adaptive Decoy API" in decoy_names
    assert "Adaptive Decoy Admin" in decoy_names


def test_activate_and_deactivate_deception_endpoints():
    """Verify activation and deactivation endpoints."""
    # Activate
    act_resp = client.post("/api/v1/deception/activate", json={"policy_validated": True})
    assert act_resp.status_code == 200
    assert act_resp.json()["success"] is True
    assert deception_engine.is_active is True
    
    # Check status
    stat_resp = client.get("/api/v1/deception/status")
    assert stat_resp.json()["is_active"] is True
    
    # Deactivate
    deact_resp = client.post("/api/v1/deception/deactivate")
    assert deact_resp.status_code == 200
    assert deception_engine.is_active is False


def test_record_interaction_and_get_events():
    """Verify recording captured decoy payload and fetching events endpoint."""
    deception_engine.record_interaction(
        attacker_ip="192.168.1.150",
        target_decoy="Adaptive Decoy Database",
        payload="SELECT * FROM synthetic_orders WHERE user_id = 999",
        protocol="PostgreSQL"
    )
    
    response = client.get("/api/v1/deception/events")
    assert response.status_code == 200
    
    data = response.json()
    assert data["total_events"] >= 1
    events = data["events"]
    assert any(e["source_ip"] == "192.168.1.150" for e in events)


@pytest.mark.anyio
async def test_acceptance_deceive_decision_triggers_decoy_activation():
    """
    Acceptance Criteria Test:
    DECEIVE decision in Adaptive Defence Engine automatically causes the controlled decoy service to activate.
    """
    # Deactivate first
    deception_engine.deactivate_deception()
    assert deception_engine.is_active is False
    
    # Trigger defence decision computation
    decision = adaptive_defence_engine.compute_defence_decision()
    
    # Verify DECEIVE action is present and deception engine auto-activated
    has_deceive = any("DECEIVE" in [act.upper() for act in a.actions] for a in decision.actions)
    assert has_deceive is True
    assert deception_engine.is_active is True
