"""
CHRONOS-WS Stage 5 Continuous Telemetry Pipeline Engine.
Handles validation, normalization, memory storage, and 10-second time-window aggregation
into canonical NetworkStates with sequential transitions (S1 -> S2 -> S3 -> S4).

7 Telemetry Event Sources:
1. network_flows
2. authentication_events
3. application_api_logs
4. host_metrics
5. database_events
6. ids_ips_events
7. load_balancer_events
"""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any
from app.models.schemas import (
    TelemetryEvent, TelemetryStatsResponse, NetworkState, NetworkStatesResponse
)

logger = logging.getLogger("CHRONOS-WS.TelemetryPipeline")

VALID_SOURCES = {
    "network_flows",
    "authentication_events",
    "application_api_logs",
    "host_metrics",
    "database_events",
    "ids_ips_events",
    "load_balancer_events"
}

VALID_SEVERITIES = {"INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"}


class TelemetryPipelineEngine:
    def __init__(self):
        self.events_buffer: List[TelemetryEvent] = []
        self.max_buffer_size: int = 2000
        self.state_history: List[NetworkState] = []
        self.max_state_history: int = 100
        self.transition_counter: int = 0

        # Initialize with baseline state S1
        self._init_baseline_state()

    def _init_baseline_state(self):
        now_str = datetime.now(timezone.utc).isoformat()
        
        # Seed initial canonical events across all 7 sources
        initial_events = [
            TelemetryEvent(event_id="EVT-NET-01", timestamp=now_str, source="network_flows", event_type="TRAFFIC_FLOW", asset_id="edge_firewall_01", severity="INFO", features={"packets": 1200, "bytes": 42000}, metadata={"protocol": "HTTPS"}),
            TelemetryEvent(event_id="EVT-AUTH-01", timestamp=now_str, source="authentication_events", event_type="LOGIN_ATTEMPT", asset_id="auth_service_01", severity="INFO", features={"failed_attempts": 0}, metadata={"user": "admin"}),
            TelemetryEvent(event_id="EVT-API-01", timestamp=now_str, source="application_api_logs", event_type="API_REQUEST", asset_id="web_server_01", severity="INFO", features={"latency_ms": 15, "status": 200}, metadata={"endpoint": "/api/v1/health"}),
            TelemetryEvent(event_id="EVT-HOST-01", timestamp=now_str, source="host_metrics", event_type="HOST_METRICS", asset_id="app_server_01", severity="INFO", features={"cpu": 25.0, "memory": 40.0}, metadata={"kernel": "Linux"}),
            TelemetryEvent(event_id="EVT-DB-01", timestamp=now_str, source="database_events", event_type="DB_QUERY", asset_id="database_01", severity="INFO", features={"rows_returned": 10}, metadata={"query": "SELECT 1;"}),
            TelemetryEvent(event_id="EVT-IDS-01", timestamp=now_str, source="ids_ips_events", event_type="RULE_MATCH", asset_id="suricata_ids_01", severity="INFO", features={"rule_id": 10001}, metadata={"signature": "Standard ICMP Ping"}),
            TelemetryEvent(event_id="EVT-LB-01", timestamp=now_str, source="load_balancer_events", event_type="TRAFFIC_REALLOCATION", asset_id="load_balancer_01", severity="INFO", features={"active_nodes": 3}, metadata={"mode": "SECURITY_AWARE_OPTIMAL"})
        ]
        for evt in initial_events:
            self.events_buffer.append(evt)

        # Seed initial state sequence S1, S2, S3
        self.state_history = [
            NetworkState(timestamp=now_str, time_step=1, state_id="S1", window_size_sec=10, transition_sequence=1, active_threat_level="LOW", connection_count=120.0, bytes_in=45000.0, bytes_out=82000.0, packets=1400.0, unique_sources=15.0, unique_destinations=6.0, unique_ports=4.0, cpu_load=28.5, memory_load=38.0, active_connections=42.0, security_risk=0.03, asset_risk=0.02),
            NetworkState(timestamp=now_str, time_step=2, state_id="S2", window_size_sec=10, transition_sequence=2, active_threat_level="LOW", connection_count=135.0, bytes_in=52000.0, bytes_out=91000.0, packets=1550.0, unique_sources=18.0, unique_destinations=6.0, unique_ports=5.0, cpu_load=31.0, memory_load=40.0, active_connections=48.0, security_risk=0.04, asset_risk=0.03),
            NetworkState(timestamp=now_str, time_step=3, state_id="S3", window_size_sec=10, transition_sequence=3, active_threat_level="ELEVATED", connection_count=160.0, bytes_in=68000.0, bytes_out=110000.0, packets=1800.0, unique_sources=22.0, unique_destinations=6.0, unique_ports=8.0, cpu_load=45.0, memory_load=52.0, active_connections=65.0, security_risk=0.18, asset_risk=0.15),
        ]
        self.transition_counter = 3

    def validate_and_normalize(self, event: TelemetryEvent) -> TelemetryEvent:
        """Validates mandatory telemetry fields and normalizes default metrics."""
        if not event.source or event.source not in VALID_SOURCES:
            event.source = "network_flows"

        if not event.severity or event.severity.upper() not in VALID_SEVERITIES:
            event.severity = "INFO"
        else:
            event.severity = event.severity.upper()

        if not event.timestamp:
            event.timestamp = datetime.now(timezone.utc).isoformat()

        if not event.event_id:
            event.event_id = f"EVT-TEL-{int(datetime.now(timezone.utc).timestamp()*1000)}"

        return event

    def ingest_event(self, event: TelemetryEvent) -> TelemetryEvent:
        """Ingests, validates, normalizes, and buffers a telemetry event."""
        norm_event = self.validate_and_normalize(event)
        self.events_buffer.append(norm_event)
        if len(self.events_buffer) > self.max_buffer_size:
            self.events_buffer.pop(0)
        return norm_event

    def ingest_telemetry(self, event: TelemetryEvent) -> TelemetryEvent:
        """Alias for ingest_event."""
        return self.ingest_event(event)

    def ingest_events_batch(self, events: List[TelemetryEvent]):
        for evt in events:
            self.ingest_event(evt)

    def get_recent_events(self, limit: int = 50, source: Optional[str] = None) -> List[TelemetryEvent]:
        """Returns recent ingested telemetry events with optional source filtering."""
        filtered = self.events_buffer
        if source:
            filtered = [e for e in filtered if e.source.lower() == source.lower()]
        
        # Sort descending by timestamp
        sorted_events = sorted(filtered, key=lambda x: x.timestamp, reverse=True)
        return sorted_events[:limit]

    def get_stats(self) -> TelemetryStatsResponse:
        """Returns real-time telemetry pipeline stats and ingestion metrics."""
        per_source: Dict[str, int] = {src: 0 for src in VALID_SOURCES}
        per_severity: Dict[str, int] = {sev: 0 for sev in VALID_SEVERITIES}

        for evt in self.events_buffer:
            if evt.source in per_source:
                per_source[evt.source] += 1
            if evt.severity in per_severity:
                per_severity[evt.severity] += 1

        total = len(self.events_buffer)
        latest_ts = self.events_buffer[-1].timestamp if self.events_buffer else datetime.now(timezone.utc).isoformat()
        
        # Simulated ingestion rate EPS (Events Per Second)
        eps = round(min(125.0, total / 10.0), 1) if total > 0 else 12.5

        return TelemetryStatsResponse(
            timestamp=datetime.now(timezone.utc).isoformat(),
            total_events=total,
            events_per_source=per_source,
            events_per_severity=per_severity,
            ingestion_rate_eps=eps,
            latest_timestamp=latest_ts
        )

    def aggregate_window(self, window_sec: int = 10) -> NetworkState:
        """
        Converts the accumulated telemetry event stream into a canonical NetworkState (S_t)
        and appends it to the state history with sequential state transitions (S1 -> S2 -> S3 -> S4).
        """
        self.transition_counter += 1
        seq_num = self.transition_counter
        state_id_str = f"S{seq_num}"

        # Aggregate recent window events
        window_events = self.get_recent_events(limit=100)
        
        conn_cnt = float(len(window_events) * 3 + 45)
        failed_logins = float(sum(1 for e in window_events if "AUTH" in e.event_type.upper() or e.severity in ["HIGH", "CRITICAL"]))
        suspicious_cnt = float(sum(1 for e in window_events if e.severity in ["MEDIUM", "HIGH", "CRITICAL"]))
        
        high_sev_count = sum(1 for e in window_events if e.severity in ["HIGH", "CRITICAL"])
        threat_level = "LOW"
        risk_score = 0.03
        if high_sev_count > 5:
            threat_level = "CRITICAL"
            risk_score = 0.85
        elif high_sev_count > 2:
            threat_level = "HIGH"
            risk_score = 0.55
        elif suspicious_cnt > 3:
            threat_level = "ELEVATED"
            risk_score = 0.25

        prev_state = self.get_latest_state()
        new_cpu = min(98.0, max(15.0, prev_state.cpu_load + (suspicious_cnt * 2.5) - 1.0))
        new_ram = min(95.0, max(20.0, prev_state.memory_load + (suspicious_cnt * 1.5)))

        state = NetworkState(
            timestamp=datetime.now(timezone.utc).isoformat(),
            time_step=seq_num,
            state_id=state_id_str,
            window_size_sec=window_sec,
            transition_sequence=seq_num,
            active_threat_level=threat_level,
            connection_count=conn_cnt,
            bytes_in=conn_cnt * 1250.0,
            bytes_out=conn_cnt * 2400.0,
            packets=conn_cnt * 12.0,
            unique_sources=min(50.0, 10.0 + (suspicious_cnt * 2)),
            unique_destinations=6.0,
            unique_ports=min(20.0, 4.0 + (suspicious_cnt)),
            failed_login_count=failed_logins,
            authentication_failure_rate=round(failed_logins / max(1.0, conn_cnt), 3),
            database_query_rate=round(conn_cnt * 0.4, 1),
            suspicious_event_count=suspicious_cnt,
            cpu_load=round(new_cpu, 1),
            memory_load=round(new_ram, 1),
            active_connections=conn_cnt,
            security_risk=round(risk_score, 3),
            asset_risk=round(risk_score * 0.9, 3)
        )

        self.state_history.append(state)
        if len(self.state_history) > self.max_state_history:
            self.state_history.pop(0)

        logger.info(f"Generated NetworkState transition: {state_id_str} (Threat: {threat_level}, Risk: {risk_score})")
        return state

    def get_state_history(self, limit: int = 50) -> NetworkStatesResponse:
        """Returns the full sequence of network state transitions."""
        states_slice = self.state_history[-limit:]
        return NetworkStatesResponse(
            states=states_slice,
            total_states=len(self.state_history)
        )

    def get_historical_states(self, limit: int = 10) -> List[NetworkState]:
        """Returns raw historical NetworkState objects list."""
        return self.state_history[-limit:]

    def get_latest_state(self) -> NetworkState:
        """Returns the most recent NetworkState (S_latest)."""
        if not self.state_history:
            self._init_baseline_state()
        return self.state_history[-1]


# Singleton global instance
telemetry_pipeline = TelemetryPipelineEngine()
