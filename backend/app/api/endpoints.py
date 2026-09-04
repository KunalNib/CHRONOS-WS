"""
FastAPI REST and WebSocket Endpoints.
Serves real-time telemetry stream, SIH demo control (/api/demo/start, /api/demo/reset, /api/demo/step),
and network state queries.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from typing import Dict, Any, List, Optional
import asyncio
import json
from app.models.schemas import (
    DemoState, NetworkState, NetworkTopology,
    SimulationStartRequest, SimulationResetRequest, SimulationStatusResponse,
    SecurityLayer, SecurityOverviewResponse, SecurityLayerEvent,
    LoadBalancerStatusResponse, LoadBalancerDecisionResponse, ServerRiskUpdateRequest,
    TelemetryEvent, TelemetryStatsResponse, NetworkStatesResponse,
    AttackPathCurrentResponse, AttackPathPredictionResponse, LLMReasoningOutput,
    ObjectivesCurrentResponse, ObjectivesHistoryResponse,
    DefenceCurrentResponse, DefenceHistoryResponse,
    DeceptionStatusResponse, DeceptionEventsResponse, DeceptionActivateRequest, DeceptionActivateResponse,
    WSEventMessage, ClosedLoopStatusResponse, ClosedLoopStartRequest
)
from app.services.demo_runner import demo_runner
from app.services.network_simulation import network_simulation_engine
from app.services.security_matrix import security_matrix_engine
from app.services.load_balancer import load_balancer
from app.services.telemetry_pipeline import telemetry_pipeline
from app.services.attack_path_engine import attack_path_engine
from app.services.llm_reasoning import llm_reasoning_service
from app.services.objective_inference import objective_engine
from app.services.adaptive_defence import adaptive_defence_engine
from app.services.deception_engine import deception_engine
from app.services.websocket_manager import ws_manager
from app.services.closed_loop_orchestrator import closed_loop_orchestrator

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive & accept incoming client messages if any
            data = await websocket.receive_text()
            logger.info(f"Received WS message: {data}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WS connection error: {e}")
        ws_manager.disconnect(websocket)


@router.get("/health")
async def health_check():
    return {"status": "HEALTHY", "service": "Autonomous Cyber Deception Platform Backend"}

# ============================================================
# STAGE 2: CONTROLLED DEFENCE NETWORK & SIMULATION ENDPOINTS
# ============================================================

@router.get("/network/topology", response_model=NetworkTopology)
async def get_network_topology():
    """Retrieve current local defence network topology and 6 asset states."""
    return network_simulation_engine.get_topology()

@router.post("/simulation/start", response_model=SimulationStatusResponse)
async def start_simulation(req: Optional[SimulationStartRequest] = None):
    """Start continuous local defence network simulation loop."""
    seed = req.seed if req else None
    tick_interval = req.tick_interval_sec if req else 1.0
    status_dict = network_simulation_engine.start(tick_interval_sec=tick_interval, seed=seed)
    return SimulationStatusResponse(**status_dict)

@router.post("/simulation/stop", response_model=SimulationStatusResponse)
async def stop_simulation():
    """Stop background local defence network simulation."""
    status_dict = network_simulation_engine.stop()
    return SimulationStatusResponse(**status_dict)

@router.post("/simulation/reset", response_model=SimulationStatusResponse)
async def reset_simulation(req: Optional[SimulationResetRequest] = None):
    """Reset network simulation assets and state with optional deterministic seed."""
    seed = req.seed if req else 42
    status_dict = network_simulation_engine.reset(seed=seed)
    return SimulationStatusResponse(**status_dict)

@router.get("/simulation/status", response_model=SimulationStatusResponse)
async def get_simulation_status():
    """Get real-time simulation metrics, tick count, active scenario, and event telemetry count."""
    status_dict = network_simulation_engine.get_status()
    return SimulationStatusResponse(**status_dict)

# ============================================================
# STAGE 3: DEFENCE-IN-DEPTH SECURITY ARCHITECTURE ENDPOINTS
# ============================================================

@router.get("/security/layers", response_model=List[SecurityLayer])
async def get_security_layers():
    """Retrieve all 9 Defense-in-Depth security layers with detailed controls."""
    return security_matrix_engine.get_layers()

@router.get("/security/overview", response_model=SecurityOverviewResponse)
async def get_security_overview():
    """Retrieve system security overview, total/active controls, risk score, and healthy layer counts."""
    return security_matrix_engine.get_overview()

@router.get("/security/events", response_model=List[SecurityLayerEvent])
async def get_security_events(limit: int = 50):
    """Retrieve recent security events across all 9 security architecture layers."""
    return security_matrix_engine.get_events(limit=limit)

# ============================================================
# STAGE 4: SECURITY-AWARE LOAD BALANCER ENDPOINTS
# ============================================================

@router.get("/load-balancer/status", response_model=LoadBalancerStatusResponse)
async def get_load_balancer_status():
    """Retrieve security-aware load balancer status, capacity metrics, and traffic allocations."""
    return load_balancer.get_status()

@router.get("/load-balancer/decision", response_model=LoadBalancerDecisionResponse)
async def get_load_balancer_decision():
    """Retrieve active routing decisions, traffic allocations, and explanation breakdown."""
    return load_balancer.get_decision()

@router.post("/load-balancer/update-risk", response_model=LoadBalancerStatusResponse)
async def update_server_risk(req: ServerRiskUpdateRequest):
    """Dynamically update a server's security risk and observe dynamic traffic reallocation."""
    return load_balancer.update_server_risk(
        server_id=req.server_id,
        security_risk=req.security_risk,
        predicted_risk=req.predicted_risk
    )

# ============================================================
# STAGE 5: CONTINUOUS TELEMETRY PIPELINE & STATE TRANSITIONS
# ============================================================

@router.get("/telemetry/recent", response_model=List[TelemetryEvent])
async def get_recent_telemetry(limit: int = 50, source: Optional[str] = None):
    """Retrieve recent canonical telemetry events across all 7 ingestion sources."""
    return telemetry_pipeline.get_recent_events(limit=limit, source=source)

@router.get("/telemetry/stats", response_model=TelemetryStatsResponse)
async def get_telemetry_stats():
    """Retrieve real-time telemetry pipeline stats, per-source counts, and EPS ingestion rate."""
    return telemetry_pipeline.get_stats()

@router.get("/network/states", response_model=NetworkStatesResponse)
async def get_network_states(limit: int = 50):
    """Retrieve history of sequential NetworkState transitions (S1 -> S2 -> S3 -> S4)."""
    return telemetry_pipeline.get_state_history(limit=limit)

@router.get("/network/states/latest", response_model=NetworkState)
async def get_latest_network_state():
    """Retrieve current latest NetworkState S_t."""
    return telemetry_pipeline.get_latest_state()

# ============================================================
# JUDGE DEMO & WEBSOCKET STREAMING ENDPOINTS
# ============================================================

@router.get("/demo/state", response_model=DemoState)
async def get_demo_state():
    return demo_runner.demo_state

@router.post("/demo/start", response_model=DemoState)
async def start_judge_demo():
    demo_runner.trigger_demo(seed=42)
    return demo_runner.demo_state

@router.post("/demo/reset", response_model=DemoState)
async def reset_judge_demo():
    return demo_runner.reset_demo()

@router.post("/demo/step", response_model=DemoState)
async def advance_judge_demo():
    state = demo_runner.step_forward()
    await broadcast_state(state.dict())
    return state

# Explicit Stage 16 Deterministic Judge Demo Routes
@router.post("/judge-demo/trigger", response_model=DemoState)
async def trigger_deterministic_judge_demo(seed: int = 42):
    state = demo_runner.trigger_demo(seed=seed)
    await broadcast_state(state.dict())
    return state

@router.post("/judge-demo/step", response_model=DemoState)
async def step_deterministic_judge_demo():
    state = demo_runner.step_forward()
    await broadcast_state(state.dict())
    return state

@router.post("/judge-demo/reset", response_model=DemoState)
async def reset_deterministic_judge_demo():
    state = demo_runner.reset_demo()
    await broadcast_state(state.dict())
    return state

@router.get("/judge-demo/status", response_model=DemoState)
async def get_judge_demo_status():
    return demo_runner.demo_state

@router.websocket("/ws/telemetry")
async def telemetry_websocket(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        await websocket.send_json(demo_runner.demo_state.model_dump())
        while True:
            data = await websocket.receive_text()
            if data == "PING":
                await websocket.send_json({"type": "PONG"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

async def broadcast_state(data: Dict[str, Any]):
    await ws_manager.broadcast_json(data)


# ============================================================
# STAGE 8: ATTACK-PATH PREDICTION ENDPOINTS
# ============================================================

@router.get("/attack-path/current", response_model=AttackPathCurrentResponse)
async def get_attack_path_current():
    """
    Retrieve current dynamic AttackPath graph, MITRE ATT&CK node statuses, and edges.
    Derived dynamically from backend prediction engine.
    """
    path = attack_path_engine.analyze_attack_path()
    return AttackPathCurrentResponse(attack_path=path)


@router.get("/attack-path/prediction", response_model=AttackPathPredictionResponse)
async def get_attack_path_prediction():
    """
    Retrieve Stage 8 Attack Stage Prediction detailing current stage, predicted next stage,
    confidence score, overall risk, affected assets, and model version.
    """
    path = attack_path_engine.analyze_attack_path()
    states = telemetry_pipeline.get_state_history(limit=10).states
    state_seq = [s.state_id for s in states] if states else ["S1_init"]
    return AttackPathPredictionResponse(
        prediction=path.prediction,
        network_state_sequence=state_seq
    )


# ============================================================
# STAGE 9: LLM REASONING LAYER ENDPOINTS
# ============================================================

@router.get("/reasoning/latest", response_model=LLMReasoningOutput)
async def get_latest_reasoning():
    """
    Retrieve latest structured LLM Reasoning output (objectives, evidence, action recommendations).
    """
    return await llm_reasoning_service.analyze()


@router.post("/reasoning/analyze", response_model=LLMReasoningOutput)
async def trigger_reasoning_analysis():
    """
    Trigger a fresh analysis run on the active LLM Reasoning Provider.
    Returns strictly validated Pydantic JSON output.
    """
    return await llm_reasoning_service.analyze()


# ============================================================
# STAGE 10: MULTI-HYPOTHESIS OBJECTIVE INFERENCE ENDPOINTS
# ============================================================

@router.get("/objectives/current", response_model=ObjectivesCurrentResponse)
async def get_current_objectives():
    """
    Retrieve current multi-hypothesis adversary objective probabilities, deltas, and evidence lists.
    Label: 'Estimated Attacker Objectives'
    """
    return objective_engine.get_current_objectives()


@router.get("/objectives/history", response_model=ObjectivesHistoryResponse)
async def get_objectives_history():
    """
    Retrieve historical sequence of adversary objective probability distributions over time.
    """
    return objective_engine.get_objectives_history()


# ============================================================
# STAGE 12: ADAPTIVE DEFENCE ENGINE ENDPOINTS
# ============================================================

@router.get("/defence/current", response_model=DefenceCurrentResponse)
async def get_current_defence():
    """
    Retrieve current validated adaptive defence decision (multi-action target recommendations,
    evidence attributions, policy engine checks).
    """
    return adaptive_defence_engine.get_current_decision()


@router.get("/defence/history", response_model=DefenceHistoryResponse)
async def get_defence_history():
    """
    Retrieve historical sequence of validated adaptive defence decisions over time.
    """
    return adaptive_defence_engine.get_defence_history()


# ============================================================
# STAGE 13: SECURE ADAPTIVE DECEPTION ENGINE ENDPOINTS
# ============================================================

@router.post("/deception/activate", response_model=DeceptionActivateResponse)
async def activate_deception_environment(req: Optional[DeceptionActivateRequest] = None):
    """
    Activate the isolated deception zone (Adaptive Decoy DB, Decoy API, Decoy Admin).
    Enforces policy validation constraint (must occur via validated defence engine).
    """
    policy_validated = req.policy_validated if req else True
    return deception_engine.activate_deception(policy_validated=policy_validated)


@router.post("/deception/deactivate", response_model=DeceptionStatusResponse)
async def deactivate_deception_environment():
    """
    Deactivate the deception environment and return decoys to standby isolation.
    """
    return deception_engine.deactivate_deception()


@router.get("/deception/status", response_model=DeceptionStatusResponse)
async def get_deception_status():
    """
    Retrieve current deception zone isolation status, realism indicators, fingerprint risk,
    active decoy services, and background synthetic activity.
    """
    return deception_engine.get_deception_status()


@router.get("/deception/events", response_model=DeceptionEventsResponse)
async def get_deception_events():
    """
    Retrieve captured attacker decoy interaction events.
    """
    return deception_engine.get_deception_events()


# ============================================================
# STAGE 14: CLOSED-LOOP ADAPTATION ENDPOINTS
# ============================================================

@router.post("/closed-loop/start", response_model=ClosedLoopStatusResponse)
async def start_closed_loop(req: Optional[ClosedLoopStartRequest] = None):
    """
    Start continuous real-time closed-loop adaptation loop broadcasting live WebSocket events.
    """
    interval_sec = req.interval_sec if req else 2.0
    return closed_loop_orchestrator.start_loop(interval_sec=interval_sec)


@router.post("/closed-loop/stop", response_model=ClosedLoopStatusResponse)
async def stop_closed_loop():
    """
    Pause continuous closed-loop adaptation loop.
    """
    return closed_loop_orchestrator.stop_loop()


@router.post("/closed-loop/step")
async def execute_closed_loop_single_step():
    """
    Manually trigger a single complete pass of the 10-stage closed-loop adaptation pipeline.
    """
    return await closed_loop_orchestrator.execute_closed_loop_step()


@router.get("/closed-loop/status", response_model=ClosedLoopStatusResponse)
async def get_closed_loop_status():
    """
    Retrieve status of closed-loop adaptation orchestrator.
    """
    return closed_loop_orchestrator.get_status()







