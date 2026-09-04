"""
Pytest test suite for CHRONOS-WS Stage 2 Controlled Defence Network.
Validates:
1. Asset model structure (id, name, type, role, health, cpu, memory, connections, security_risk, trust_level)
2. Network topology API GET /api/v1/network/topology returning all 6 assets
3. Simulation control APIs (/start, /stop, /reset, /status)
4. Deterministic seeding reproducibility
5. Continuous asset state mutations during active simulation
"""

import sys
import os
import time
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app
from app.services.network_simulation import network_simulation_engine

client = TestClient(app)


def test_network_topology_structure():
    """Verify GET /api/v1/network/topology returns 6 required assets with proper fields."""
    response = client.get("/api/v1/network/topology")
    assert response.status_code == 200
    data = response.json()
    
    assert "assets" in data
    assert "links" in data
    assert "total_connections" in data
    assert "average_risk" in data
    
    assets = data["assets"]
    assert len(assets) == 6
    
    asset_types = {a["type"] for a in assets}
    expected_types = {"Web Server", "API Server", "Authentication Service", "Database", "Admin Service", "Load Balancer"}
    assert expected_types.issubset(asset_types)
    
    # Validate Asset fields
    for asset in assets:
        assert "id" in asset
        assert "name" in asset
        assert "type" in asset
        assert "role" in asset
        assert "health" in asset
        assert "cpu" in asset
        assert "memory" in asset
        assert "connections" in asset
        assert "security_risk" in asset
        assert "trust_level" in asset
        
        assert 0.0 <= asset["health"] <= 100.0
        assert 0.0 <= asset["cpu"] <= 100.0
        assert 0.0 <= asset["memory"] <= 100.0
        assert asset["connections"] >= 0
        assert 0.0 <= asset["security_risk"] <= 1.0
        assert 0.0 <= asset["trust_level"] <= 1.0


def test_simulation_lifecycle_controls():
    """Verify POST /start, GET /status, POST /stop, and POST /reset endpoints."""
    # Reset first
    res_reset = client.post("/api/v1/simulation/reset", json={"seed": 100})
    assert res_reset.status_code == 200
    data_reset = res_reset.json()
    assert data_reset["is_running"] is False
    assert data_reset["seed"] == 100
    assert data_reset["total_ticks"] == 0
    
    # Start simulation
    res_start = client.post("/api/v1/simulation/start", json={"seed": 100, "tick_interval_sec": 0.1})
    assert res_start.status_code == 200
    data_start = res_start.json()
    assert data_start["is_running"] is True
    
    # Check status after start
    res_status = client.get("/api/v1/simulation/status")
    assert res_status.status_code == 200
    data_status = res_status.json()
    assert data_status["is_running"] is True
    assert data_status["total_ticks"] >= 1
    
    # Stop simulation
    res_stop = client.post("/api/v1/simulation/stop")
    assert res_stop.status_code == 200
    data_stop = res_stop.json()
    assert data_stop["is_running"] is False


def test_deterministic_seeding():
    """Verify deterministic seed produces identical initial metrics on reset."""
    client.post("/api/v1/simulation/reset", json={"seed": 777})
    topo1 = client.get("/api/v1/network/topology").json()
    
    # Perform mutations
    network_simulation_engine._tick()
    network_simulation_engine._tick()
    
    # Reset with same seed
    client.post("/api/v1/simulation/reset", json={"seed": 777})
    topo2 = client.get("/api/v1/network/topology").json()
    
    # Initial asset cpu values must match exactly
    for a1, a2 in zip(topo1["assets"], topo2["assets"]):
        assert a1["id"] == a2["id"]
        assert a1["cpu"] == a2["cpu"]
        assert a1["memory"] == a2["memory"]


def test_continuous_state_mutation():
    """Verify that ticking the simulation mutates asset state continuous metrics."""
    client.post("/api/v1/simulation/reset", json={"seed": 42})
    initial_topo = client.get("/api/v1/network/topology").json()
    
    # Execute ticks
    network_simulation_engine._tick()
    network_simulation_engine._tick()
    
    mutated_topo = client.get("/api/v1/network/topology").json()
    
    # Verify continuous state changed
    initial_cpus = [a["cpu"] for a in initial_topo["assets"]]
    mutated_cpus = [a["cpu"] for a in mutated_topo["assets"]]
    
    assert initial_cpus != mutated_cpus
