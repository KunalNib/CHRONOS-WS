"""
Pytest test suite for CHRONOS-WS Stage 4 Security-Aware Load Balancer.
Validates:
1. GET /api/v1/load-balancer/status returns all servers with required capacity & security risk fields.
2. GET /api/v1/load-balancer/decision returns active routing decision & traffic allocations.
3. ACCEPTANCE TEST: Elevating Server B's risk dynamically reduces its traffic_percentage and shifts traffic to Server A & C.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app

client = TestClient(app)


def test_get_load_balancer_status():
    """Verify /load-balancer/status returns 3 servers with required metrics."""
    response = client.get("/api/v1/load-balancer/status")
    assert response.status_code == 200
    data = response.json()

    assert "routing_mode" in data
    assert "total_traffic_rate_rps" in data
    assert "active_servers" in data
    assert "average_system_risk" in data
    assert "servers" in data
    assert len(data["servers"]) == 3

    server_b = next((s for s in data["servers"] if s["id"] == "server_b"), None)
    assert server_b is not None
    assert "health" in server_b
    assert "cpu" in server_b
    assert "memory" in server_b
    assert "connection_count" in server_b
    assert "current_load" in server_b
    assert "security_risk" in server_b
    assert "predicted_risk" in server_b
    assert "traffic_percentage" in server_b
    assert "routing_score" in server_b
    assert "routing_reason" in server_b


def test_get_load_balancer_decision():
    """Verify /load-balancer/decision returns decision explanation and allocations."""
    response = client.get("/api/v1/load-balancer/decision")
    assert response.status_code == 200
    data = response.json()

    assert "decision_id" in data
    assert "primary_route" in data
    assert "traffic_allocations" in data
    assert "routing_reasons" in data
    assert "decision_explanation" in data


def test_acceptance_server_risk_changes_routing_preference():
    """
    STAGE 4 ACCEPTANCE CRITERIA:
    When Server B becomes high-risk, reduce its simulated routing allocation.
    """
    # 1. Reset Server B to LOW risk (0.05)
    reset_resp = client.post("/api/v1/load-balancer/update-risk", json={
        "server_id": "server_b",
        "security_risk": 0.05
    })
    assert reset_resp.status_code == 200
    initial_servers = reset_resp.json()["servers"]
    sb_initial = next(s for s in initial_servers if s["id"] == "server_b")
    initial_alloc = sb_initial["traffic_percentage"]

    assert initial_alloc > 25.0, f"Expected Server B initial traffic > 25%, got {initial_alloc}%"

    # 2. Elevate Server B risk to HIGH (0.85)
    high_risk_resp = client.post("/api/v1/load-balancer/update-risk", json={
        "server_id": "server_b",
        "security_risk": 0.85
    })
    assert high_risk_resp.status_code == 200
    updated_servers = high_risk_resp.json()["servers"]
    sb_high_risk = next(s for s in updated_servers if s["id"] == "server_b")
    high_risk_alloc = sb_high_risk["traffic_percentage"]

    # Verify Server B allocation dropped significantly
    assert high_risk_alloc < 5.0, f"Expected Server B high-risk traffic < 5%, got {high_risk_alloc}%"
    assert sb_high_risk["status"] in ["DEPRIORITIZED", "DEGRADED"]
    assert "High Security Risk" in sb_high_risk["routing_reason"]

    # Verify low-risk servers (Server A & C) absorbed the remaining traffic
    sa = next(s for s in updated_servers if s["id"] == "server_a")
    sc = next(s for s in updated_servers if s["id"] == "server_c")
    assert (sa["traffic_percentage"] + sc["traffic_percentage"]) > 95.0
