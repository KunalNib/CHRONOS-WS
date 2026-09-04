import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"].lower() == "healthy"

def test_simulation_status():
    response = client.get("/api/v1/simulation/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_running" in data

def test_network_topology():
    response = client.get("/api/v1/network/topology")
    assert response.status_code == 200
    data = response.json()
    assert "assets" in data

def test_security_layers():
    response = client.get("/api/v1/security/layers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 9

def test_attack_path_current():
    response = client.get("/api/v1/attack-path/current")
    assert response.status_code == 200
    data = response.json()
    assert "attack_path" in data

def test_objectives_current():
    response = client.get("/api/v1/objectives/current")
    assert response.status_code == 200
    data = response.json()
    assert "objectives" in data

def test_defence_current():
    response = client.get("/api/v1/defence/current")
    assert response.status_code == 200
    data = response.json()
    assert "decision" in data

def test_deception_status():
    response = client.get("/api/v1/deception/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_active" in data

def test_closed_loop_status():
    response = client.get("/api/v1/closed-loop/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_running" in data
