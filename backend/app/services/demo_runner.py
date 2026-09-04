"""
Stage 16 — Deterministic SIH Judge Demonstration Controller.
Scenario: "Credential-to-Database Adaptive Defence"
Fixed seed: 42 (Repeatable Demonstration)

Executes 11 deterministic phases with explicit progress indicators:
1 / 11 NORMAL
2 / 11 TELEMETRY CHANGE
3 / 11 NETWORK STATE UPDATE
4 / 11 FUTURE PREDICTION
5 / 11 ATTACK PATH PREDICTION
6 / 11 OBJECTIVE INFERENCE
7 / 11 ADAPTIVE DEFENCE
8 / 11 LOAD BALANCER RESPONSE
9 / 11 DECEPTION ACTIVATED
10 / 11 DECOY INTERACTION
11 / 11 FEEDBACK & UPDATED PREDICTION
"""

import random
from typing import List, Optional
from app.models.schemas import (
    DemoState, NetworkState, TelemetryEvent, AttackPathForecast,
    ObjectiveHypotheses, LLMReasoningOutput, DeceptionState,
    LoadBalancerState, DefenseInDepthStatus
)
from app.services.telemetry_generator import telemetry_generator
from app.services.state_aggregator import state_aggregator
from app.services.world_model import world_model
from app.services.attack_predictor import attack_predictor
from app.services.objective_inference import objective_engine
from app.services.llm_reasoning import llm_reasoning_engine
from app.services.policy_validator import policy_validator
from app.services.load_balancer import load_balancer
from app.services.deception_engine import deception_engine

PHASE_LABELS = [
    "1 / 11 NORMAL",
    "2 / 11 TELEMETRY CHANGE",
    "3 / 11 NETWORK STATE UPDATE",
    "4 / 11 FUTURE PREDICTION",
    "5 / 11 ATTACK PATH PREDICTION",
    "6 / 11 OBJECTIVE INFERENCE",
    "7 / 11 ADAPTIVE DEFENCE",
    "8 / 11 LOAD BALANCER RESPONSE",
    "9 / 11 DECEPTION ACTIVATED",
    "10 / 11 DECOY INTERACTION",
    "11 / 11 FEEDBACK & UPDATED PREDICTION"
]

PHASE_DESCRIPTIONS = [
    "Normal network baseline operating with nominal telemetry ingress.",
    "Suspicious connection burst detected from untrusted IP 192.168.99.150.",
    "Authentication failure anomaly threshold exceeded (12 attempts / 2.4s).",
    "AI World Model forecasts elevated future threat state S_{t+1} (Credential Access Risk: 78%).",
    "Attack-Path Engine calculates high-probability path to Database via Admin Service.",
    "Multi-Hypothesis Objective Engine inferring dominant Credential Harvesting intent (78%).",
    "Adaptive Defence Engine issues validated multi-action policy recommendation: PROTECT + DECEIVE.",
    "NGINX Load Balancer dynamically reduces Server B traffic weight from 33% to 10%.",
    "Adaptive Decoy Database activated on isolated VLAN 99 honey port 5433.",
    "Attacker trapped in Decoy Zone; query payload logged with ZERO access to real DB.",
    "Closed-loop telemetry feedback updates network state and lowers real asset risk to LOW."
]

class DemoRunner:
    def __init__(self, default_seed: int = 42):
        self.default_seed = default_seed
        self.seed = default_seed
        self.is_running = False
        self.current_step = 1
        self.total_steps = 11
        self.scenario_name = "Credential-to-Database Adaptive Defence"
        self.history_states: List[NetworkState] = []
        self.recent_events: List[TelemetryEvent] = []
        
        self.trigger_demo(seed=self.default_seed)

    def trigger_demo(self, seed: int = 42) -> DemoState:
        """Triggers or resets the deterministic Judge Demo with fixed seed."""
        self.seed = seed
        random.seed(seed)
        self.is_running = True
        self.current_step = 1
        self.total_steps = 11

        deception_engine.deactivate_deception()
        load_balancer.reset_weights()

        self.recent_events = [
            telemetry_generator.generate_event("NORMAL") for _ in range(3)
        ]
        
        init_state = state_aggregator.aggregate(self.recent_events, scenario_stage="NORMAL")
        self.history_states = [init_state]
        
        pred_state = world_model.predict_next_state(self.history_states)
        atk_path = attack_predictor.forecast_attack_path(init_state, pred_state)
        objs = objective_engine.estimate_objectives(init_state, pred_state)
        llm_out = llm_reasoning_engine.generate_reasoning(init_state, pred_state, atk_path, objs)
        val_llm = policy_validator.validate_action(llm_out, DefenseInDepthStatus())
        lb_state = load_balancer.update_routing("MONITOR")
        dec_state = deception_engine.get_deception_state()

        self.demo_state = DemoState(
            is_running=True,
            current_step=1,
            total_steps=11,
            step_title=PHASE_LABELS[0],
            step_description=PHASE_DESCRIPTIONS[0],
            current_state=init_state,
            predicted_state=pred_state,
            attack_path=atk_path,
            objectives=objs,
            llm_reasoning=val_llm,
            deception_state=dec_state,
            load_balancer=lb_state,
            security_matrix=DefenseInDepthStatus(),
            recent_events=self.recent_events
        )
        return self.demo_state

    def reset_demo(self) -> DemoState:
        """Alias to trigger_demo with fixed seed."""
        return self.trigger_demo(seed=self.default_seed)

    def step_forward(self) -> DemoState:
        """Advances deterministically through the 11 phases."""
        if self.current_step >= self.total_steps:
            self.current_step = self.total_steps
            return self.demo_state

        self.current_step += 1
        phase_idx = self.current_step - 1

        # Phase logic mapping
        if self.current_step == 2:
            stage = "RECON"
            event = telemetry_generator.generate_event("RECON")
        elif self.current_step == 3:
            stage = "PASSWORD_SPRAY"
            event = telemetry_generator.generate_event("PASSWORD_SPRAY")
        elif self.current_step in [4, 5, 6]:
            stage = "PASSWORD_SPRAY"
            event = telemetry_generator.generate_event("PASSWORD_SPRAY")
        elif self.current_step in [7, 8, 9]:
            stage = "DB_EXFIL"
            event = telemetry_generator.generate_event("DB_EXFIL")
        elif self.current_step == 10:
            stage = "DECEIVE"
            deception_engine.record_interaction(
                attacker_ip="192.168.99.150",
                target_decoy="Adaptive Decoy DB (Port 5433)",
                payload="SELECT * FROM admin_credentials;"
            )
            event = telemetry_generator.generate_event("DECEIVE")
        else: # Step 11
            stage = "NORMAL"
            event = telemetry_generator.generate_event("NORMAL")

        self.recent_events.insert(0, event)
        if len(self.recent_events) > 10:
            self.recent_events.pop()

        if self.current_step == 9:
            deception_engine.activate_deception()

        current_state = state_aggregator.aggregate(self.recent_events, scenario_stage=stage)
        self.history_states.append(current_state)
        
        pred_state = world_model.predict_next_state(self.history_states)
        atk_path = attack_predictor.forecast_attack_path(current_state, pred_state)
        objs = objective_engine.estimate_objectives(
            current_state,
            pred_state,
            decoy_interacted=(self.current_step >= 10)
        )
        llm_out = llm_reasoning_engine.generate_reasoning(
            current_state,
            pred_state,
            atk_path,
            objs,
            decoy_active=deception_engine.is_active
        )
        val_llm = policy_validator.validate_action(llm_out, DefenseInDepthStatus())
        
        action_for_lb = "DECEIVE" if self.current_step >= 8 else "MONITOR"
        lb_state = load_balancer.update_routing(action_for_lb)

        self.demo_state.current_step = self.current_step
        self.demo_state.step_title = PHASE_LABELS[phase_idx]
        self.demo_state.step_description = PHASE_DESCRIPTIONS[phase_idx]
        self.demo_state.current_state = current_state
        self.demo_state.predicted_state = pred_state
        self.demo_state.attack_path = atk_path
        self.demo_state.objectives = objs
        self.demo_state.llm_reasoning = val_llm
        self.demo_state.load_balancer = lb_state
        self.demo_state.deception_state = deception_engine.get_deception_state()
        self.demo_state.recent_events = self.recent_events

        return self.demo_state

demo_runner = DemoRunner(default_seed=42)
