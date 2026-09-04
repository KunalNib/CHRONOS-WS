"""
CHRONOS-WS Stage 14 Closed-Loop Adaptation Orchestration Engine.
Integrates all 13 stages into a continuous, real-time feedback loop:
Flow:
Simulation -> Telemetry -> Network State -> World Model -> Future State Prediction ->
Attack Path -> Risk -> Objective Hypotheses -> LLM Reasoning -> Policy Validation ->
Defence Decision -> Protect/Monitor/Deceive -> Deception Interaction -> New Telemetry Feedback -> Updated State
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from app.models.schemas import ClosedLoopStatusResponse
from app.services.websocket_manager import ws_manager
from app.services.network_simulation import network_simulation_engine
from app.services.telemetry_pipeline import telemetry_pipeline
from app.services.attack_path_engine import attack_path_engine
from app.services.objective_inference import objective_engine
from app.services.llm_reasoning import llm_reasoning_service
from app.services.adaptive_defence import adaptive_defence_engine
from app.services.load_balancer import load_balancer
from app.services.deception_engine import deception_engine
from app.services.world_model import world_model

logger = logging.getLogger("CHRONOS-WS.ClosedLoopOrchestrator")


class ClosedLoopOrchestrator:
    def __init__(self):
        self.is_running: bool = False
        self.current_step: int = 0
        self.interval_sec: float = 2.0
        self.last_event_type: str = "INITIALIZED"
        self._loop_task: Optional[asyncio.Task] = None

    async def execute_closed_loop_step(self) -> Dict[str, Any]:
        """
        Executes a single complete pass of the 10-stage Closed-Loop Adaptation pipeline,
        broadcasting real-time WebSocket events for each stage.
        """
        self.current_step += 1
        logger.info(f"[CLOSED-LOOP STEP {self.current_step}] Beginning adaptation cycle...")

        # Stage 1: Simulation -> Telemetry Event Generation
        telemetry_event = network_simulation_engine.generate_step()
        telemetry_pipeline.ingest_telemetry(telemetry_event)
        await ws_manager.broadcast("telemetry_update", telemetry_event.model_dump())

        # Stage 2: Network State Aggregation
        latest_net_state = telemetry_pipeline.get_latest_state()
        await ws_manager.broadcast("network_state_update", latest_net_state.model_dump())

        # Stage 3: World Model LSTM Future State Prediction
        historical_states = telemetry_pipeline.get_historical_states(limit=10)
        predicted_state = world_model.predict_next_state(historical_states)
        await ws_manager.broadcast("prediction_update", predicted_state.model_dump())

        # Stage 4: Attack Path Analysis & Risk Assessment
        attack_path_obj = attack_path_engine.analyze_attack_path()
        await ws_manager.broadcast("attack_path_update", attack_path_obj.model_dump())
        
        risk_payload = {
            "current_stage": attack_path_obj.prediction.current_stage,
            "predicted_next_stage": attack_path_obj.prediction.predicted_next_stage,
            "risk": attack_path_obj.prediction.risk,
            "confidence": attack_path_obj.prediction.confidence,
            "affected_assets": attack_path_obj.prediction.affected_assets
        }
        await ws_manager.broadcast("risk_update", risk_payload)

        # Stage 5: Objective Hypotheses Inference
        objectives_resp = objective_engine.get_current_objectives()
        await ws_manager.broadcast("objective_update", objectives_resp.model_dump())

        # Stage 6 & 7: Policy-Validated Adaptive Defence Decision
        defence_resp = adaptive_defence_engine.get_current_decision()
        await ws_manager.broadcast("defence_update", defence_resp.model_dump())

        # Stage 8: Load Balancer Security-Aware Action
        lb_status = load_balancer.get_status()
        await ws_manager.broadcast("load_balancer_update", lb_status.model_dump())

        # Stage 9: Deception Environment Zone & Decoy Status
        deception_status = deception_engine.get_deception_status()
        await ws_manager.broadcast("deception_update", deception_status.model_dump())

        # Stage 10: Deception Interaction & Telemetry Feedback Loop
        feedback_event = None
        if deception_engine.is_active:
            # Attacker decoy trap interaction generates telemetry feedback
            decoy_target = "Adaptive Decoy Database" if self.current_step % 2 == 0 else "Adaptive Decoy API"
            decoy_payload = "SELECT * FROM synthetic_orders WHERE user_id = 999" if self.current_step % 2 == 0 else "POST /v2/api/auth/token"
            
            decoy_ev = deception_engine.record_interaction(
                attacker_ip="192.168.99.150",
                target_decoy=decoy_target,
                payload=decoy_payload,
                protocol="PostgreSQL" if "Database" in decoy_target else "HTTP/REST"
            )
            
            feedback_event = {
                "step": self.current_step,
                "feedback_source": "VLAN 99 Deception Trap",
                "attacker_ip": decoy_ev.source_ip,
                "target_decoy": decoy_ev.target_decoy,
                "decoy_port": decoy_ev.decoy_port,
                "captured_payload": decoy_ev.payload_summary,
                "feedback_impact": "Injected into next telemetry cycle as critical forensic signal"
            }
            await ws_manager.broadcast("feedback_update", feedback_event)

        self.last_event_type = "CLOSED_LOOP_CYCLE_COMPLETE"
        logger.info(f"[CLOSED-LOOP STEP {self.current_step} COMPLETE] Risk: {attack_path_obj.prediction.risk}, Deception Active: {deception_engine.is_active}")

        return {
            "step": self.current_step,
            "risk": attack_path_obj.prediction.risk,
            "attack_stage": attack_path_obj.prediction.current_stage,
            "deception_active": deception_engine.is_active,
            "feedback_generated": feedback_event is not None
        }

    async def _run_loop(self):
        """Asynchronous background worker task running continuous closed-loop cycles."""
        logger.info(f"[CLOSED-LOOP WORKER STARTED] Interval: {self.interval_sec}s")
        try:
            while self.is_running:
                await self.execute_closed_loop_step()
                await asyncio.sleep(self.interval_sec)
        except asyncio.CancelledError:
            logger.info("[CLOSED-LOOP WORKER PAUSED]")
        except Exception as e:
            logger.error(f"[CLOSED-LOOP WORKER ERROR] {e}", exc_info=True)
            self.is_running = False

    def start_loop(self, interval_sec: float = 2.0) -> ClosedLoopStatusResponse:
        """Starts continuous closed-loop adaptation background execution."""
        self.interval_sec = interval_sec
        if not self.is_running:
            self.is_running = True
            loop = asyncio.get_event_loop()
            self._loop_task = loop.create_task(self._run_loop())
            logger.info(f"[CLOSED-LOOP STARTED] Loop task created with interval {interval_sec}s.")
        return self.get_status()

    def stop_loop(self) -> ClosedLoopStatusResponse:
        """Pauses continuous closed-loop adaptation execution."""
        self.is_running = False
        if self._loop_task and not self._loop_task.done():
            self._loop_task.cancel()
            self._loop_task = None
        logger.info("[CLOSED-LOOP PAUSED] Loop task cancelled.")
        return self.get_status()

    def get_status(self) -> ClosedLoopStatusResponse:
        """Returns current status of closed-loop orchestrator."""
        attack_path_obj = attack_path_engine.analyze_attack_path()
        return ClosedLoopStatusResponse(
            timestamp=datetime.now(timezone.utc).isoformat(),
            is_running=self.is_running,
            current_step=self.current_step,
            loop_interval_sec=self.interval_sec,
            active_ws_clients=len(ws_manager.active_connections),
            last_event_type=self.last_event_type,
            current_attack_stage=attack_path_obj.prediction.current_stage,
            current_risk=attack_path_obj.prediction.risk,
            deception_active=deception_engine.is_active
        )


# Global Singleton Instance
closed_loop_orchestrator = ClosedLoopOrchestrator()
