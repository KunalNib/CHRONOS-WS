"""
CHRONOS-WS Stage 2 Network Simulation Engine.
Manages simulated local defence network assets, continuous synthetic traffic generation,
safe synthetic suspicious scenarios, and deterministic simulation seeding.
"""

import asyncio
import logging
import random
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from app.models.schemas import Asset, NetworkLink, NetworkTopology, TelemetryEvent

logger = logging.getLogger("CHRONOS-WS.Simulation")


DEFAULT_ASSETS = [
    Asset(
        id="web_server_01",
        name="Web Server",
        type="Web Server",
        role="Frontend Web Application Server",
        health=98.5,
        cpu=18.2,
        memory=34.0,
        connections=45,
        security_risk=0.05,
        trust_level=0.95
    ),
    Asset(
        id="api_server_01",
        name="API Server",
        type="API Server",
        role="Core Business Logic REST API",
        health=99.0,
        cpu=24.5,
        memory=42.1,
        connections=62,
        security_risk=0.08,
        trust_level=0.90
    ),
    Asset(
        id="auth_service_01",
        name="Authentication Service",
        type="Authentication Service",
        role="Identity & Access Management (OAuth2/JWT)",
        health=100.0,
        cpu=12.0,
        memory=28.5,
        connections=30,
        security_risk=0.02,
        trust_level=0.99
    ),
    Asset(
        id="database_01",
        name="Database",
        type="Database",
        role="Primary Relational Datastore (PostgreSQL)",
        health=99.5,
        cpu=28.0,
        memory=55.4,
        connections=85,
        security_risk=0.04,
        trust_level=0.98
    ),
    Asset(
        id="admin_service_01",
        name="Admin Service",
        type="Admin Service",
        role="Internal System Administration & Management Portal",
        health=100.0,
        cpu=8.5,
        memory=22.0,
        connections=5,
        security_risk=0.01,
        trust_level=0.99
    ),
    Asset(
        id="load_balancer_01",
        name="Load Balancer",
        type="Load Balancer",
        role="Edge Traffic Router & Ingress Gateway",
        health=99.9,
        cpu=15.0,
        memory=20.0,
        connections=140,
        security_risk=0.03,
        trust_level=0.97
    )
]

DEFAULT_LINKS = [
    NetworkLink(source="load_balancer_01", target="web_server_01", protocol="HTTPS/443", status="ACTIVE"),
    NetworkLink(source="load_balancer_01", target="api_server_01", protocol="HTTPS/443", status="ACTIVE"),
    NetworkLink(source="web_server_01", target="api_server_01", protocol="HTTP/8080", status="ACTIVE"),
    NetworkLink(source="api_server_01", target="auth_service_01", protocol="gRPC/50051", status="ACTIVE"),
    NetworkLink(source="api_server_01", target="database_01", protocol="TCP/5432", status="ACTIVE"),
    NetworkLink(source="admin_service_01", target="database_01", protocol="TCP/5432", status="ACTIVE"),
    NetworkLink(source="admin_service_01", target="auth_service_01", protocol="HTTPS/8443", status="ACTIVE"),
]

SCENARIOS = [
    "NORMAL_TRAFFIC",
    "INCREASED_CONNECTION_RATE",
    "UNUSUAL_PORT_DIVERSITY",
    "REPEATED_AUTH_FAILURES",
    "UNUSUAL_DATABASE_ACCESS",
    "UNUSUAL_HOST_TO_HOST_COMMUNICATION"
]


class NetworkSimulationEngine:
    def __init__(self, seed: Optional[int] = 42):
        self.seed = seed
        self.rng = random.Random(seed)
        self.assets: Dict[str, Asset] = {a.id: a.model_copy(deep=True) for a in DEFAULT_ASSETS}
        self.links: List[NetworkLink] = [l.model_copy(deep=True) for l in DEFAULT_LINKS]
        
        self.is_running: bool = False
        self.start_time: Optional[float] = None
        self.total_ticks: int = 0
        self.events_generated: int = 0
        self.active_scenario: str = "NORMAL_TRAFFIC"
        self.last_event_time: Optional[str] = None
        self.simulation_task: Optional[asyncio.Task] = None
        self.recent_events: List[TelemetryEvent] = []

    def reset(self, seed: Optional[int] = 42):
        """Reset simulation to initial state with optional deterministic seed."""
        self.stop()
        self.seed = seed
        self.rng = random.Random(seed)
        self.assets = {a.id: a.model_copy(deep=True) for a in DEFAULT_ASSETS}
        self.links = [l.model_copy(deep=True) for l in DEFAULT_LINKS]
        self.total_ticks = 0
        self.events_generated = 0
        self.active_scenario = "NORMAL_TRAFFIC"
        self.start_time = None
        self.last_event_time = None
        self.recent_events.clear()
        logger.info(f"Simulation engine reset with seed={seed}")
        return self.get_status()

    def generate_step(self) -> TelemetryEvent:
        """Executes a single simulation tick and returns the generated TelemetryEvent."""
        self._tick()
        if self.recent_events:
            return self.recent_events[-1]
        now_str = datetime.now(timezone.utc).isoformat()
        return TelemetryEvent(
            event_id=f"EVT-STEP-{self.total_ticks}",
            timestamp=now_str,
            source_ip="192.168.1.105",
            dest_ip="10.0.0.10 (Load Balancer)",
            dest_port=443,
            protocol="HTTPS",
            event_type="SIMULATION_STEP",
            payload_summary=f"Synthetic Telemetry Event - Tick #{self.total_ticks}",
            severity="INFO"
        )

    def start(self, tick_interval_sec: float = 1.0, seed: Optional[int] = None):
        """Start continuous simulation loop."""
        if seed is not None:
            self.seed = seed
            self.rng = random.Random(seed)
        
        if self.is_running:
            return self.get_status()
            
        self.is_running = True
        self.start_time = time.time()
        self.simulation_task = asyncio.create_task(self._simulation_loop(tick_interval_sec))
        logger.info("Simulation engine started.")
        return self.get_status()

    def stop(self):
        """Stop background simulation."""
        self.is_running = False
        if self.simulation_task and not self.simulation_task.done():
            self.simulation_task.cancel()
        self.simulation_task = None
        logger.info("Simulation engine stopped.")
        return self.get_status()

    def get_status(self) -> Dict[str, Any]:
        """Return status dictionary of current simulation."""
        elapsed = (time.time() - self.start_time) if (self.is_running and self.start_time) else 0.0
        return {
            "is_running": self.is_running,
            "seed": self.seed,
            "elapsed_seconds": round(elapsed, 2),
            "total_ticks": self.total_ticks,
            "active_scenario": self.active_scenario,
            "events_generated": self.events_generated,
            "last_event_time": self.last_event_time
        }

    def get_topology(self) -> NetworkTopology:
        """Return current network topology and asset states."""
        asset_list = list(self.assets.values())
        total_conn = sum(a.connections for a in asset_list)
        avg_risk = sum(a.security_risk for a in asset_list) / len(asset_list) if asset_list else 0.0
        active_threats = sum(1 for a in asset_list if a.security_risk > 0.4)
        
        return NetworkTopology(
            timestamp=datetime.now(timezone.utc).isoformat(),
            assets=asset_list,
            links=self.links,
            total_connections=total_conn,
            average_risk=round(avg_risk, 3),
            active_threats=active_threats
        )

    async def _simulation_loop(self, tick_interval: float):
        """Main async loop updating network state and generating synthetic traffic."""
        try:
            while self.is_running:
                self._tick()
                await asyncio.sleep(tick_interval)
        except asyncio.CancelledError:
            pass

    def _tick(self):
        """Single simulation tick update."""
        self.total_ticks += 1
        
        # Periodically rotate scenario every 10 ticks for dynamic behavior
        if self.total_ticks % 10 == 0:
            scenario_idx = (self.total_ticks // 10) % len(SCENARIOS)
            self.active_scenario = SCENARIOS[scenario_idx]
            logger.info(f"Scenario updated to: {self.active_scenario}")
            
        self._generate_synthetic_events()
        self._update_asset_metrics()

    def _update_asset_metrics(self):
        """Continuously update CPU, memory, health, connections, and security risk per asset."""
        for asset_id, asset in self.assets.items():
            # Add small random fluctuation
            cpu_delta = self.rng.uniform(-2.0, 2.5)
            mem_delta = self.rng.uniform(-1.0, 1.5)
            conn_delta = self.rng.randint(-3, 4)

            # Scenario-specific state dynamics
            if self.active_scenario == "INCREASED_CONNECTION_RATE" and asset_id in ["load_balancer_01", "api_server_01"]:
                conn_delta += self.rng.randint(15, 30)
                cpu_delta += self.rng.uniform(5.0, 12.0)
                asset.security_risk = min(1.0, asset.security_risk + 0.05)
                
            elif self.active_scenario == "UNUSUAL_PORT_DIVERSITY" and asset_id == "web_server_01":
                conn_delta += self.rng.randint(5, 12)
                asset.security_risk = min(1.0, asset.security_risk + 0.08)

            elif self.active_scenario == "REPEATED_AUTH_FAILURES" and asset_id == "auth_service_01":
                cpu_delta += self.rng.uniform(8.0, 15.0)
                asset.security_risk = min(1.0, asset.security_risk + 0.1)

            elif self.active_scenario == "UNUSUAL_DATABASE_ACCESS" and asset_id == "database_01":
                mem_delta += self.rng.uniform(4.0, 10.0)
                cpu_delta += self.rng.uniform(10.0, 20.0)
                asset.security_risk = min(1.0, asset.security_risk + 0.12)

            elif self.active_scenario == "UNUSUAL_HOST_TO_HOST_COMMUNICATION" and asset_id in ["web_server_01", "database_01"]:
                asset.security_risk = min(1.0, asset.security_risk + 0.15)
                asset.trust_level = max(0.0, asset.trust_level - 0.05)
            else:
                # Gradual risk decay back to baseline under normal traffic
                asset.security_risk = max(0.01, asset.security_risk - 0.02)
                asset.trust_level = min(0.99, asset.trust_level + 0.01)

            # Apply bounds
            asset.cpu = max(2.0, min(99.0, round(asset.cpu + cpu_delta, 1)))
            asset.memory = max(10.0, min(98.0, round(asset.memory + mem_delta, 1)))
            asset.connections = max(1, asset.connections + conn_delta)
            
            # Health calculation based on load and risk
            load_factor = (asset.cpu + asset.memory) / 2.0
            health_penalty = (asset.security_risk * 30.0) + (max(0, load_factor - 80) * 0.5)
            asset.health = max(10.0, min(100.0, round(100.0 - health_penalty, 1)))

    def _generate_synthetic_events(self):
        """Generate safe synthetic telemetry events representing normal and suspicious activity."""
        now_str = datetime.now(timezone.utc).isoformat()
        self.last_event_time = now_str
        
        events_to_add = []
        
        if self.active_scenario == "NORMAL_TRAFFIC":
            # Normal web/api/db traffic
            events_to_add.append(TelemetryEvent(
                event_id=f"EVT-NORM-{self.total_ticks}-1",
                timestamp=now_str,
                source_ip="192.168.1.105",
                dest_ip="10.0.0.10 (Load Balancer)",
                dest_port=443,
                protocol="HTTPS",
                event_type="API_REQUEST",
                payload_summary="GET /api/v1/user/profile HTTP/1.1 200 OK",
                severity="INFO"
            ))
            events_to_add.append(TelemetryEvent(
                event_id=f"EVT-NORM-{self.total_ticks}-2",
                timestamp=now_str,
                source_ip="10.0.0.11 (API Server)",
                dest_ip="10.0.0.13 (Database)",
                dest_port=5432,
                protocol="PostgreSQL",
                event_type="DB_QUERY",
                payload_summary="SELECT * FROM users WHERE id = $1;",
                severity="INFO"
            ))
            
        elif self.active_scenario == "INCREASED_CONNECTION_RATE":
            events_to_add.append(TelemetryEvent(
                event_id=f"EVT-SUSP-{self.total_ticks}-1",
                timestamp=now_str,
                source_ip="192.168.1.200",
                dest_ip="10.0.0.10 (Load Balancer)",
                dest_port=443,
                protocol="HTTP",
                event_type="TRAFFIC_SPIKE",
                payload_summary="High connection burst detected: >500 req/sec from single sub-network",
                severity="MEDIUM"
            ))

        elif self.active_scenario == "UNUSUAL_PORT_DIVERSITY":
            events_to_add.append(TelemetryEvent(
                event_id=f"EVT-SUSP-{self.total_ticks}-2",
                timestamp=now_str,
                source_ip="10.0.0.50",
                dest_ip="10.0.0.11 (API Server)",
                dest_port=self.rng.choice([22, 23, 80, 443, 3306, 5432, 8080, 9200]),
                protocol="TCP",
                event_type="PORT_SCAN",
                payload_summary="SYN probe detected across multiple distinct destination ports",
                severity="HIGH"
            ))

        elif self.active_scenario == "REPEATED_AUTH_FAILURES":
            events_to_add.append(TelemetryEvent(
                event_id=f"EVT-SUSP-{self.total_ticks}-3",
                timestamp=now_str,
                source_ip="192.168.1.99",
                dest_ip="10.0.0.12 (Auth Service)",
                dest_port=8443,
                protocol="HTTPS",
                event_type="LOGIN_ATTEMPT",
                payload_summary="POST /api/v1/auth/login 401 Unauthorized (Failure #14)",
                severity="HIGH"
            ))

        elif self.active_scenario == "UNUSUAL_DATABASE_ACCESS":
            events_to_add.append(TelemetryEvent(
                event_id=f"EVT-SUSP-{self.total_ticks}-4",
                timestamp=now_str,
                source_ip="10.0.0.11 (API Server)",
                dest_ip="10.0.0.13 (Database)",
                dest_port=5432,
                protocol="PostgreSQL",
                event_type="DB_QUERY",
                payload_summary="SELECT * FROM admin_credentials; -- Suspicious bulk table dump",
                severity="CRITICAL"
            ))

        elif self.active_scenario == "UNUSUAL_HOST_TO_HOST_COMMUNICATION":
            events_to_add.append(TelemetryEvent(
                event_id=f"EVT-SUSP-{self.total_ticks}-5",
                timestamp=now_str,
                source_ip="10.0.0.14 (Web Server)",
                dest_ip="10.0.0.13 (Database)",
                dest_port=5432,
                protocol="TCP",
                event_type="UNUSUAL_COMMUNICATION",
                payload_summary="Direct connection attempt bypasses API layer (Web Server -> DB)",
                severity="CRITICAL"
            ))

        # Ingest generated events into Stage 5 Telemetry Pipeline
        from app.services.telemetry_pipeline import telemetry_pipeline
        
        # Build telemetry across all 7 canonical sources
        sources_telemetry = [
            TelemetryEvent(
                event_id=f"EVT-NET-{self.total_ticks}",
                timestamp=now_str,
                source="network_flows",
                event_type="TRAFFIC_FLOW",
                asset_id="edge_firewall_01",
                severity="INFO",
                features={"packets": 1250, "bytes": 45000},
                metadata={"protocol": "HTTPS", "src_ip": "192.168.1.105"}
            ),
            TelemetryEvent(
                event_id=f"EVT-AUTH-{self.total_ticks}",
                timestamp=now_str,
                source="authentication_events",
                event_type="LOGIN_ATTEMPT",
                asset_id="auth_service_01",
                severity="HIGH" if self.active_scenario == "REPEATED_AUTH_FAILURES" else "INFO",
                features={"failed_attempts": 14 if self.active_scenario == "REPEATED_AUTH_FAILURES" else 0},
                metadata={"user": "admin", "method": "OAuth2"}
            ),
            TelemetryEvent(
                event_id=f"EVT-API-{self.total_ticks}",
                timestamp=now_str,
                source="application_api_logs",
                event_type="API_REQUEST",
                asset_id="web_server_01",
                severity="INFO",
                features={"latency_ms": 18, "status": 200},
                metadata={"endpoint": "/api/v1/user/profile"}
            ),
            TelemetryEvent(
                event_id=f"EVT-HOST-{self.total_ticks}",
                timestamp=now_str,
                source="host_metrics",
                event_type="HOST_METRICS",
                asset_id="app_server_01",
                severity="INFO",
                features={"cpu": 32.0, "memory": 45.0},
                metadata={"kernel": "Linux 6.1"}
            ),
            TelemetryEvent(
                event_id=f"EVT-DB-{self.total_ticks}",
                timestamp=now_str,
                source="database_events",
                event_type="DB_QUERY",
                asset_id="database_01",
                severity="CRITICAL" if self.active_scenario == "UNUSUAL_DATABASE_ACCESS" else "INFO",
                features={"rows_returned": 1500 if self.active_scenario == "UNUSUAL_DATABASE_ACCESS" else 5},
                metadata={"query": "SELECT * FROM users;"}
            ),
            TelemetryEvent(
                event_id=f"EVT-IDS-{self.total_ticks}",
                timestamp=now_str,
                source="ids_ips_events",
                event_type="PORT_SCAN" if self.active_scenario == "UNUSUAL_PORT_DIVERSITY" else "RULE_MATCH",
                asset_id="suricata_ids_01",
                severity="HIGH" if self.active_scenario == "UNUSUAL_PORT_DIVERSITY" else "INFO",
                features={"rule_id": 200142},
                metadata={"signature": "ET SCAN Potential Port Scan"}
            ),
            TelemetryEvent(
                event_id=f"EVT-LB-{self.total_ticks}",
                timestamp=now_str,
                source="load_balancer_events",
                event_type="TRAFFIC_REALLOCATION",
                asset_id="load_balancer_01",
                severity="INFO",
                features={"active_nodes": 3, "primary_node": "server_a"},
                metadata={"mode": "SECURITY_AWARE_OPTIMAL"}
            )
        ]

        all_events = events_to_add + sources_telemetry
        self.recent_events.extend(all_events)
        self.events_generated += len(all_events)
        if len(self.recent_events) > 50:
            self.recent_events = self.recent_events[-50:]

        # Ingest to telemetry pipeline engine
        telemetry_pipeline.ingest_events_batch(all_events)
        
        # Trigger 10-second window aggregation into sequential NetworkStates (S1 -> S2 -> S3 -> S4)
        if self.total_ticks % 2 == 0 or self.total_ticks == 1:
            telemetry_pipeline.aggregate_window(window_sec=10)


# Global singleton simulation engine
network_simulation_engine = NetworkSimulationEngine()
