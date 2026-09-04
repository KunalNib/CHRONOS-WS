"""
Pytest test suite for CHRONOS-WS Stage 9 LLM Reasoning Layer.
Validates:
1. GET /api/v1/reasoning/latest endpoint & LLMReasoningOutput schema.
2. POST /api/v1/reasoning/analyze endpoint & structured Pydantic JSON output.
3. LLMProvider interface & MockLLMProvider rule-based fallback.
4. ObjectiveScores (credentials, database, administrative_access).
5. Action Recommendations (PROTECT, MONITOR, DECEIVE).
6. Provider labeling & read-only safety lock (execution_blocked=True).
7. Acceptance Criteria: Current state can be sent to reasoning layer and structured reasoning returned.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app
from app.services.llm_reasoning import llm_reasoning_service, MockLLMProvider
from app.models.schemas import LLMReasoningOutput

client = TestClient(app)


def test_get_reasoning_latest_endpoint():
    """Verify GET /api/v1/reasoning/latest returns HTTP 200 and structured LLMReasoningOutput."""
    response = client.get("/api/v1/reasoning/latest")
    assert response.status_code == 200
    
    data = response.json()
    assert "current_attack_stage" in data
    assert "predicted_next_stage" in data
    assert "risk" in data
    assert "confidence" in data
    assert "objectives" in data
    assert "evidence" in data
    assert "actions" in data
    assert "provider" in data
    assert "is_mock" in data
    assert data["execution_blocked"] is True


def test_post_reasoning_analyze_endpoint():
    """Verify POST /api/v1/reasoning/analyze triggers fresh analysis with HTTP 200."""
    response = client.post("/api/v1/reasoning/analyze")
    assert response.status_code == 200
    
    data = response.json()
    assert data["risk"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert 0.0 <= data["confidence"] <= 1.0
    
    objectives = data["objectives"]
    assert "credentials" in objectives
    assert "database" in objectives
    assert "administrative_access" in objectives
    assert 0.0 <= objectives["credentials"] <= 1.0


def test_action_recommendation_types():
    """Verify action recommendations return valid PROTECT, MONITOR, or DECEIVE actions."""
    response = client.get("/api/v1/reasoning/latest")
    data = response.json()
    
    actions = data["actions"]
    assert len(actions) > 0
    
    valid_action_types = {"PROTECT", "MONITOR", "DECEIVE"}
    for act in actions:
        assert act["action"] in valid_action_types
        assert "target" in act
        assert "reason" in act


def test_provider_labeling_and_safety_lock():
    """Verify provider is explicitly labeled and direct command execution is blocked."""
    response = client.get("/api/v1/reasoning/latest")
    data = response.json()
    
    assert data["provider"] == "LOCAL DEMO FALLBACK REASONER (RULE-BASED MOCK)"
    assert data["is_mock"] is True
    assert data["execution_blocked"] is True


@pytest.mark.anyio
async def test_acceptance_structured_reasoning_returned():
    """
    Acceptance Criteria Test:
    Current state can be sent to the reasoning layer and structured reasoning returned.
    """
    reasoning = await llm_reasoning_service.analyze()
    assert isinstance(reasoning, LLMReasoningOutput)
    assert reasoning.current_attack_stage is not None
    assert reasoning.predicted_next_stage is not None
    assert len(reasoning.evidence) >= 1
    assert len(reasoning.actions) >= 1
