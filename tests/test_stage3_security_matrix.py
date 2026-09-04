"""
Pytest test suite for CHRONOS-WS Stage 3 Defense-in-Depth Security Architecture.
Validates:
1. GET /api/v1/security/layers returns all 9 security layers
2. Mandatory fields per layer (id, layer, controls, status, risk, events, last_checked)
3. Every required control per layer is present (firewall, ACL, IDS/IPS, segmentation, rate limiting, etc.)
4. GET /api/v1/security/overview returns total/active control counts and health breakdown
5. GET /api/v1/security/events returns aggregated layer events list
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app

client = TestClient(app)

REQUIRED_LAYERS_AND_CONTROLS = {
    "NETWORK/PERIMETER": {"firewall", "ACL", "IDS/IPS", "segmentation", "rate limiting"},
    "LOAD BALANCER": {"secure transport", "health checks", "connection controls", "rate limiting", "security-aware routing"},
    "APPLICATION": {"authentication", "authorization", "RBAC", "input validation", "API protection"},
    "HOST": {"hardening", "least privilege", "process monitoring", "HIDS", "integrity"},
    "DATA": {"encryption", "access control", "integrity"},
    "TELEMETRY": {"validation", "secure collection", "audit logging", "log integrity"},
    "AI": {"trusted input", "prediction validation", "confidence threshold", "model access control", "audit"},
    "DEFENCE": {"policy validation", "authorized actions", "audit logs"},
    "DECEPTION": {"isolation", "firewall", "ACL", "least privilege", "monitoring", "resource limits", "secure logs"}
}


def test_get_security_layers():
    """Verify GET /api/v1/security/layers returns exactly 9 layers with required fields."""
    response = client.get("/api/v1/security/layers")
    assert response.status_code == 200
    layers = response.json()
    
    assert len(layers) == 9
    
    returned_layer_names = {l["layer"] for l in layers}
    assert set(REQUIRED_LAYERS_AND_CONTROLS.keys()) == returned_layer_names
    
    for layer_data in layers:
        assert "id" in layer_data
        assert "layer" in layer_data
        assert "controls" in layer_data
        assert "status" in layer_data
        assert "risk" in layer_data
        assert "events" in layer_data
        assert "last_checked" in layer_data
        
        # Verify controls match specification
        expected_controls = REQUIRED_LAYERS_AND_CONTROLS[layer_data["layer"]]
        actual_controls = {c["name"] for c in layer_data["controls"]}
        assert expected_controls.issubset(actual_controls), f"Missing controls in {layer_data['layer']}: {expected_controls - actual_controls}"
        
        # Verify control schema
        for control in layer_data["controls"]:
            assert "name" in control
            assert "enabled" in control
            assert "status" in control


def test_get_security_overview():
    """Verify GET /api/v1/security/overview returns overall system status and aggregated counts."""
    response = client.get("/api/v1/security/overview")
    assert response.status_code == 200
    overview = response.json()
    
    assert overview["total_layers"] == 9
    assert overview["healthy_layers"] >= 0
    assert overview["total_controls"] >= 35
    assert overview["active_controls"] >= 30
    assert "system_security_status" in overview
    assert len(overview["layers"]) == 9


def test_get_security_events():
    """Verify GET /api/v1/security/events returns security layer events."""
    response = client.get("/api/v1/security/events")
    assert response.status_code == 200
    events = response.json()
    
    assert isinstance(events, list)
    assert len(events) > 0
    for evt in events:
        assert "id" in evt
        assert "timestamp" in evt
        assert "severity" in evt
        assert "message" in evt
