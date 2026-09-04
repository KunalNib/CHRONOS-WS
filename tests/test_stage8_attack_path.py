"""
Pytest test suite for CHRONOS-WS Stage 8 Attack-Path Prediction.
Validates:
1. GET /api/v1/attack-path/current endpoint & AttackPath schema structure.
2. GET /api/v1/attack-path/prediction endpoint & AttackStagePrediction fields.
3. MITRE ATT&CK tactic & technique mapping.
4. Node status assignments (COMPLETED, ACTIVE, PREDICTED, POTENTIAL).
5. Acceptance Criteria: The attack path is derived dynamically from backend prediction state.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app
from app.services.attack_path_engine import attack_path_engine
from app.models.schemas import AttackPath, AttackStagePrediction

client = TestClient(app)


def test_get_attack_path_current_endpoint():
    """Verify GET /api/v1/attack-path/current returns HTTP 200 and dynamic AttackPath."""
    response = client.get("/api/v1/attack-path/current")
    assert response.status_code == 200
    
    data = response.json()
    assert "attack_path" in data
    path = data["attack_path"]
    
    assert "path_id" in path
    assert "nodes" in path
    assert "edges" in path
    assert "prediction" in path
    assert len(path["nodes"]) >= 5
    assert len(path["edges"]) >= 4


def test_get_attack_path_prediction_endpoint():
    """Verify GET /api/v1/attack-path/prediction returns HTTP 200 and prediction metadata."""
    response = client.get("/api/v1/attack-path/prediction")
    assert response.status_code == 200
    
    data = response.json()
    assert "prediction" in data
    pred = data["prediction"]
    
    assert "current_stage" in pred
    assert "predicted_next_stage" in pred
    assert "future_stages" in pred
    assert "confidence" in pred
    assert "risk" in pred
    assert "affected_assets" in pred
    assert "model_version" in pred
    assert 0.0 <= pred["confidence"] <= 1.0


def test_mitre_attack_tactics_and_techniques():
    """Verify MITRE ATT&CK terminology is present on nodes."""
    path = attack_path_engine.analyze_attack_path()
    
    tactics = [node.tactic for node in path.nodes]
    techniques = [node.technique for node in path.nodes if node.technique]
    
    # Check for MITRE ATT&CK tactic IDs
    assert any("TA0007" in t or "TA0043" in t for t in tactics)
    assert any("TA0001" in t for t in tactics)
    assert any("TA0006" in t for t in tactics)
    
    # Check for MITRE ATT&CK technique IDs
    assert any("T1046" in tech for tech in techniques)
    assert any("T1190" in tech for tech in techniques)


def test_acceptance_derived_from_backend_prediction_state():
    """
    Acceptance Criteria Test:
    The attack path is derived from backend prediction state rather than static UI text.
    """
    path = attack_path_engine.analyze_attack_path()
    
    # Verify node statuses reflect progression state
    statuses = {node.status for node in path.nodes}
    assert "ACTIVE" in statuses
    assert "PREDICTED" in statuses
    
    # Verify active node prediction matches prediction header
    active_node = next(n for n in path.nodes if n.status == "ACTIVE")
    predicted_node = next(n for n in path.nodes if n.status == "PREDICTED")
    
    assert active_node.label in path.prediction.current_stage or path.prediction.current_stage in active_node.label
    assert predicted_node.label in path.prediction.predicted_next_stage or path.prediction.predicted_next_stage in predicted_node.label
