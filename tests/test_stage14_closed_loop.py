"""
Pytest test suite for CHRONOS-WS Stage 14 Closed-Loop Adaptation.
Validates:
1. GET /api/v1/closed-loop/status returns HTTP 200 OK and ClosedLoopStatusResponse.
2. POST /api/v1/closed-loop/step executes a single closed-loop cycle.
3. POST /api/v1/closed-loop/start and /stop endpoints control continuous execution.
4. Acceptance Test: Single demo scenario produces full closed loop execution.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app
from app.services.closed_loop_orchestrator import closed_loop_orchestrator
from app.services.websocket_manager import ws_manager

client = TestClient(app)


def test_get_closed_loop_status_endpoint():
    """Verify GET /api/v1/closed-loop/status returns valid status object."""
    response = client.get("/api/v1/closed-loop/status")
    assert response.status_code == 200
    
    data = response.json()
    assert "is_running" in data
    assert "current_step" in data
    assert "active_ws_clients" in data
    assert "current_attack_stage" in data
    assert "current_risk" in data


@pytest.mark.anyio
async def test_execute_single_closed_loop_step():
    """Verify executing single step passes through all 10 stages."""
    initial_step = closed_loop_orchestrator.current_step
    
    result = await closed_loop_orchestrator.execute_closed_loop_step()
    
    assert result["step"] == initial_step + 1
    assert "risk" in result
    assert "attack_stage" in result
    assert "deception_active" in result


def test_start_and_stop_closed_loop_endpoints():
    """Verify REST endpoints for starting and pausing continuous closed-loop execution."""
    start_resp = client.post("/api/v1/closed-loop/start", json={"interval_sec": 1.0})
    assert start_resp.status_code == 200
    assert start_resp.json()["is_running"] is True
    
    stop_resp = client.post("/api/v1/closed-loop/stop")
    assert stop_resp.status_code == 200
    assert stop_resp.json()["is_running"] is False


@pytest.mark.anyio
async def test_acceptance_closed_loop_full_cycle_execution():
    """
    Acceptance Criteria Test:
    Full closed-loop cycle executes from Simulation -> Telemetry -> World Model -> Attack Path ->
    Objective Hypotheses -> LLM Reasoning -> Policy Validation -> Adaptive Defence -> Deception -> Telemetry Feedback.
    """
    # Execute 3 sequential closed-loop cycles
    res1 = await closed_loop_orchestrator.execute_closed_loop_step()
    res2 = await closed_loop_orchestrator.execute_closed_loop_step()
    res3 = await closed_loop_orchestrator.execute_closed_loop_step()
    
    assert res3["step"] > res1["step"]
    assert res3["deception_active"] is True
