"""
Time Window Aggregator.
Aggregates sliding window of raw TelemetryEvents into canonical NetworkState S_t.
"""

from typing import List
from datetime import datetime, timezone
from app.models.schemas import NetworkState, TelemetryEvent

class StateAggregator:
    def __init__(self):
        self.current_step = 0

    def aggregate(self, events: List[TelemetryEvent], scenario_stage: str = "NORMAL") -> NetworkState:
        """
        Converts sliding window of events into canonical NetworkState vector S_t.
        """
        self.current_step += 1
        
        conn_count = float(len(events) * 12 + 15)
        bytes_in = float(sum(len(e.payload_summary) * 45 for e in events) + 2500)
        bytes_out = float(bytes_in * 1.4)
        packets = float(conn_count * 8)
        unique_srcs = float(len(set(e.source_ip for e in events)) or 1)
        unique_dests = float(len(set(e.dest_ip for e in events)) or 1)
        unique_ports = float(len(set(e.dest_port for e in events)) or 1)
        
        syn_count = float(sum(1 for e in events if "SCAN" in e.event_type or "SYN" in e.payload_summary))
        failed_logins = float(sum(1 for e in events if "FAILED" in e.event_type))
        db_queries = float(sum(1 for e in events if "DB" in e.event_type or "SELECT" in e.payload_summary))
        suspicious = float(sum(1 for e in events if e.severity in ["HIGH", "CRITICAL"]))
        
        # Calculate risk scores
        sec_risk = 0.05
        if scenario_stage == "RECON":
            sec_risk = 0.30
        elif scenario_stage == "PASSWORD_SPRAY":
            sec_risk = 0.65
        elif scenario_stage == "DB_EXFIL":
            sec_risk = 0.92
        elif scenario_stage == "DECEIVE":
            sec_risk = 0.98

        asset_risk = min(1.0, sec_risk * 1.05)

        return NetworkState(
            timestamp=datetime.now(timezone.utc).isoformat(),
            time_step=self.current_step,
            connection_count=conn_count,
            bytes_in=bytes_in,
            bytes_out=bytes_out,
            packets=packets,
            unique_sources=unique_srcs,
            unique_destinations=unique_dests,
            unique_ports=unique_ports,
            syn_count=syn_count,
            rst_count=float(syn_count * 0.2),
            request_rate=float(len(events) / 5.0 if events else 2.0),
            failed_login_count=failed_logins,
            authentication_failure_rate=min(1.0, failed_logins / 10.0),
            database_query_rate=db_queries,
            suspicious_event_count=suspicious,
            cpu_load=min(95.0, 15.0 + (sec_risk * 70.0)),
            memory_load=min(90.0, 25.0 + (sec_risk * 50.0)),
            active_connections=conn_count,
            security_risk=round(sec_risk, 2),
            asset_risk=round(asset_risk, 2)
        )

state_aggregator = StateAggregator()
