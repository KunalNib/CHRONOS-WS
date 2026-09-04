"""
CHRONOS-WS Stage 4 Security-Aware Load Balancer Engine.
Manages dynamic traffic routing between application server pool nodes based on capacity and security risk.

Inputs per server node:
- health
- CPU
- memory
- connection count
- current load
- security risk
- predicted risk

Calculates:
- routing_score
- traffic_percentage
- routing_reason
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from app.models.schemas import (
    ServerLoadMetrics, LoadBalancerStatusResponse, LoadBalancerDecisionResponse, LoadBalancerState
)

logger = logging.getLogger("CHRONOS-WS.LoadBalancer")


INITIAL_SERVERS: List[Dict[str, Any]] = [
    {
        "id": "server_a",
        "name": "Server A (Primary Web)",
        "health": 98.5,
        "cpu": 32.0,
        "memory": 40.0,
        "connection_count": 120,
        "current_load": 42.0,
        "security_risk": 0.05,
        "predicted_risk": 0.05,
    },
    {
        "id": "server_b",
        "name": "Server B (Secondary Web)",
        "health": 99.0,
        "cpu": 45.0,
        "memory": 50.0,
        "connection_count": 160,
        "current_load": 51.0,
        "security_risk": 0.08,
        "predicted_risk": 0.08,
    },
    {
        "id": "server_c",
        "name": "Server C (Edge Gateway)",
        "health": 100.0,
        "cpu": 28.0,
        "memory": 35.0,
        "connection_count": 90,
        "current_load": 38.0,
        "security_risk": 0.02,
        "predicted_risk": 0.02,
    }
]


class SecurityAwareLoadBalancer:
    def __init__(self):
        self.state = LoadBalancerState(
            routing_mode="MONITOR",
            prod_traffic_split=100.0,
            decoy_traffic_split=0.0,
            active_rules=["Default round-robin", "Health-check active", "TLS 1.3 enforced"]
        )
        self.servers: Dict[str, ServerLoadMetrics] = {}
        self._init_servers()

    def _init_servers(self):
        for s in INITIAL_SERVERS:
            metrics = ServerLoadMetrics(
                id=s["id"],
                name=s["name"],
                health=s["health"],
                cpu=s["cpu"],
                memory=s["memory"],
                connection_count=s["connection_count"],
                current_load=s["current_load"],
                security_risk=s["security_risk"],
                predicted_risk=s["predicted_risk"],
            )
            self.servers[s["id"]] = metrics
        self.recalculate_routing()

    def reset_weights(self):
        self.state.routing_mode = "MONITOR"
        self.state.prod_traffic_split = 100.0
        self.state.decoy_traffic_split = 0.0
        self._init_servers()

    def recalculate_routing(self):
        """
        Recalculates routing scores and traffic percentages across all server pool nodes.
        Formula:
        - effective_risk = max(security_risk, 0.7 * predicted_risk)
        - base_capacity_score = 100.0 - (0.4 * current_load + 0.3 * cpu + 0.3 * memory)
        - health_mult = health / 100.0
        - risk_penalty = 120.0 * (effective_risk ** 2.2)
        - raw_score = max(0.1, (base_capacity_score * health_mult) - risk_penalty)
        """
        total_score = 0.0
        scores: Dict[str, float] = {}

        for server_id, server in self.servers.items():
            eff_risk = max(server.security_risk, 0.7 * server.predicted_risk)
            base_capacity = 100.0 - (0.4 * server.current_load + 0.3 * server.cpu + 0.3 * server.memory)
            health_mult = server.health / 100.0
            risk_penalty = 120.0 * (eff_risk ** 2.2)

            raw_score = max(0.1, (base_capacity * health_mult) - risk_penalty)
            score = round(raw_score, 2)
            scores[server_id] = score
            server.routing_score = score
            total_score += score

            # Determine routing reason and status
            if eff_risk >= 0.65:
                server.status = "DEPRIORITIZED"
                server.routing_reason = f"High Security Risk ({eff_risk:.2f}): Traffic allocation penalized"
            elif eff_risk >= 0.35:
                server.status = "DEGRADED"
                server.routing_reason = f"Elevated Risk ({eff_risk:.2f}): Traffic routing reduced for containment"
            elif server.health < 80.0:
                server.status = "DEGRADED"
                server.routing_reason = f"Degraded Health ({server.health}%): Lower capacity assigned"
            else:
                server.status = "HEALTHY"
                server.routing_reason = f"Optimal capacity & low risk ({eff_risk:.2f})"

        # Calculate traffic percentages
        if total_score > 0:
            for server_id, server in self.servers.items():
                alloc = round((scores[server_id] / total_score) * 100.0, 1)
                server.traffic_percentage = alloc

    def update_server_risk(
        self,
        server_id: str,
        security_risk: float,
        predicted_risk: Optional[float] = None
    ) -> LoadBalancerStatusResponse:
        """Dynamically update a server node's security risk and recalculate traffic allocation."""
        if server_id not in self.servers:
            # Fallback mapping if friendly name passed
            id_map = {"Server A": "server_a", "Server B": "server_b", "Server C": "server_c"}
            server_id = id_map.get(server_id, server_id)

        if server_id in self.servers:
            server = self.servers[server_id]
            server.security_risk = min(1.0, max(0.0, security_risk))
            if predicted_risk is not None:
                server.predicted_risk = min(1.0, max(0.0, predicted_risk))
            else:
                server.predicted_risk = server.security_risk

            logger.info(f"Updated {server.name} security_risk to {server.security_risk:.2f}")
            self.recalculate_routing()

        return self.get_status()

    def get_status(self) -> LoadBalancerStatusResponse:
        self.recalculate_routing()
        server_list = list(self.servers.values())
        avg_risk = sum(s.security_risk for s in server_list) / len(server_list) if server_list else 0.0
        
        mode = "SECURITY_AWARE_OPTIMAL"
        if any(s.security_risk >= 0.65 for s in server_list):
            mode = "SECURITY_DEGRADE_CONTAINMENT"

        return LoadBalancerStatusResponse(
            timestamp=datetime.now(timezone.utc).isoformat(),
            routing_mode=mode,
            total_traffic_rate_rps=1450.0,
            active_servers=len(server_list),
            average_system_risk=round(avg_risk, 3),
            servers=server_list
        )

    def get_decision(self) -> LoadBalancerDecisionResponse:
        status = self.get_status()
        allocations = {s.id: s.traffic_percentage for s in status.servers}
        reasons = {s.id: s.routing_reason for s in status.servers}
        
        # Determine primary route (highest allocation)
        primary = max(status.servers, key=lambda s: s.traffic_percentage).name
        risk_penalty_active = any(s.security_risk >= 0.35 for s in status.servers)

        explanation = (
            "Traffic allocated based on capacity scores and security risk penalties. "
            "High-risk nodes automatically deprioritized."
        )

        return LoadBalancerDecisionResponse(
            timestamp=datetime.now(timezone.utc).isoformat(),
            decision_id=f"DEC-LB-{int(datetime.now(timezone.utc).timestamp())}",
            primary_route=primary,
            traffic_allocations=allocations,
            routing_reasons=reasons,
            decision_explanation=explanation,
            risk_penalty_applied=risk_penalty_active
        )

    def update_routing(self, decision_action: str) -> LoadBalancerState:
        action = decision_action.upper()
        if action == "DECEIVE":
            self.state.routing_mode = "DECEIVE"
            self.state.prod_traffic_split = 30.0
            self.state.decoy_traffic_split = 70.0
        elif action == "PROTECT":
            self.state.routing_mode = "PROTECT"
            self.state.prod_traffic_split = 100.0
            self.state.decoy_traffic_split = 0.0
        else:
            self.state.routing_mode = "MONITOR"
            self.state.prod_traffic_split = 100.0
            self.state.decoy_traffic_split = 0.0
        return self.state


load_balancer = SecurityAwareLoadBalancer()
