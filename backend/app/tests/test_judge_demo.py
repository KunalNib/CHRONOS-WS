import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.demo_runner import PHASE_LABELS

client = TestClient(app)

def test_deterministic_judge_demo_full_loop():
    """Verify 11-phase deterministic scenario with fixed seed 42."""
    # 1. Trigger deterministic demo with seed=42
    resp = client.post("/api/v1/judge-demo/trigger?seed=42")
    assert resp.status_code == 200
    data = resp.json()
    assert data["current_step"] == 1
    assert data["total_steps"] == 11
    assert data["step_title"] == PHASE_LABELS[0]  # "1 / 11 NORMAL"

    # Step through all 11 phases
    titles = [data["step_title"]]
    for step in range(2, 12):
        step_resp = client.post("/api/v1/judge-demo/step")
        assert step_resp.status_code == 200
        step_data = step_resp.json()
        assert step_data["current_step"] == min(step, 11)
        titles.append(step_data["step_title"])

    # Verify all 11 phase titles match exact spec
    assert titles == PHASE_LABELS

def test_repeatability_with_fixed_seed():
    """Verify 2 consecutive runs produce 100% identical outputs."""
    # Run 1
    resp1 = client.post("/api/v1/judge-demo/trigger?seed=42").json()
    steps1 = [resp1["step_title"]]
    for _ in range(10):
        steps1.append(client.post("/api/v1/judge-demo/step").json()["step_title"])

    # Run 2 (Reset & re-trigger with seed=42)
    resp2 = client.post("/api/v1/judge-demo/trigger?seed=42").json()
    steps2 = [resp2["step_title"]]
    for _ in range(10):
        steps2.append(client.post("/api/v1/judge-demo/step").json()["step_title"])

    # Must be 100% identical across runs
    assert steps1 == steps2
    assert len(steps1) == 11
