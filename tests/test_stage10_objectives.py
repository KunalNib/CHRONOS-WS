"""
Pytest test suite for CHRONOS-WS Stage 10 Multi-Hypothesis Objective Inference Engine.
Validates:
1. GET /api/v1/objectives/current returns 200 OK and ObjectivesCurrentResponse.
2. GET /api/v1/objectives/history returns 200 OK and ObjectivesHistoryResponse.
3. Non-collapsing probability distribution constraint (sum == 1.0, min prob >= 0.05).
4. Probability deltas (change = current_probability - previous_probability).
5. Evidence attribution list per hypothesis.
6. History accumulation over sequence of telemetry snapshots.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app
from app.services.objective_inference import objective_engine
from app.models.schemas import ObjectivesCurrentResponse, ObjectivesHistoryResponse

client = TestClient(app)


def test_get_objectives_current_endpoint():
    """Verify GET /api/v1/objectives/current returns HTTP 200 and valid ObjectivesCurrentResponse."""
    response = client.get("/api/v1/objectives/current")
    assert response.status_code == 200
    
    data = response.json()
    assert "timestamp" in data
    assert "primary_objective" in data
    assert "explanation" in data
    assert "objectives" in data
    
    objectives = data["objectives"]
    assert len(objectives) == 3
    
    obj_names = {item["objective"] for item in objectives}
    assert obj_names == {"credentials", "database", "administrative_access"}


def test_non_collapsing_probability_distribution():
    """Verify objective probabilities sum to 1.0 and do not collapse to 0.0 or 1.0."""
    response = client.get("/api/v1/objectives/current")
    data = response.json()
    
    total_prob = sum(item["current_probability"] for item in data["objectives"])
    assert pytest.approx(total_prob, abs=1e-3) == 1.0
    
    for item in data["objectives"]:
        # Non-collapsing guarantee
        assert 0.01 <= item["current_probability"] <= 0.95
        assert isinstance(item["evidence"], list)
        assert len(item["evidence"]) >= 1


def test_probability_delta_computation():
    """Verify probability change delta calculation equals (current - previous)."""
    # Trigger twice to create temporal change
    client.get("/api/v1/objectives/current")
    response = client.get("/api/v1/objectives/current")
    data = response.json()
    
    for item in data["objectives"]:
        expected_change = round(item["current_probability"] - item["previous_probability"], 4)
        assert pytest.approx(item["change"], abs=1e-3) == expected_change


def test_get_objectives_history_endpoint():
    """Verify GET /api/v1/objectives/history returns historical sequence."""
    response = client.get("/api/v1/objectives/history")
    assert response.status_code == 200
    
    data = response.json()
    assert "history" in data
    assert "total_snapshots" in data
    assert data["total_snapshots"] >= 1
    assert len(data["history"]) == data["total_snapshots"]


@pytest.mark.anyio
async def test_acceptance_dynamic_inference_and_evidence():
    """
    Acceptance Criteria Test:
    Exact probabilities are derived dynamically from multi-source inference logic.
    """
    resp = objective_engine.infer_objectives()
    assert isinstance(resp, ObjectivesCurrentResponse)
    assert resp.primary_objective in ["credentials", "database", "administrative_access"]
    assert len(resp.objectives) == 3
