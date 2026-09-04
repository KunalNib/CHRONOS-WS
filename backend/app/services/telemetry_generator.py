"""
Telemetry Generator & Dataset Adapter.
Supports continuous synthetic telemetry stream (CIC-IDS-2018 & CTU-13 compatible) and pre-seeded attack vectors.
"""

import random
from datetime import datetime, timezone
from typing import List
from app.models.schemas import TelemetryEvent

NORMAL_SOURCES = ["192.168.1.105", "192.168.1.112", "192.168.1.140", "10.0.4.15"]
ATTACKER_IPS = ["198.51.100.44", "203.0.113.89"]
TARGET_NODES = [
    ("10.0.1.10", 80, "HTTP", "Web-Server-01"),
    ("10.0.1.20", 443, "HTTPS", "API-Gateway"),
    ("10.0.2.50", 5432, "PostgreSQL", "PostgreSQL-CrownJewel")
]

class TelemetryGenerator:
    def __init__(self):
        self.counter = 0

    def generate_event(self, threat_level: str = "NORMAL") -> TelemetryEvent:
        self.counter += 1
        ts = datetime.now(timezone.utc).isoformat()
        
        if threat_level == "NORMAL":
            src = random.choice(NORMAL_SOURCES)
            dest_ip, port, proto, name = random.choice(TARGET_NODES)
            event_type = random.choice(["GET /api/v1/health", "POST /api/v1/auth/login", "SELECT count(*) FROM users"])
            severity = "INFO"
            payload = f"Normal traffic flow to {name}"
        elif threat_level == "RECON":
            src = ATTACKER_IPS[0]
            dest_ip, port, proto, name = TARGET_NODES[0]
            event_type = "PORT_SCAN"
            severity = "MEDIUM"
            payload = f"SYN scan detected across ports 22, 80, 443, 5432 on {name}"
        elif threat_level == "PASSWORD_SPRAY":
            src = ATTACKER_IPS[0]
            dest_ip, port, proto, name = TARGET_NODES[0]
            event_type = "FAILED_LOGIN"
            severity = "HIGH"
            payload = f"Password spray attempt on {name}: 25 failed auth attempts in 5 seconds"
        elif threat_level == "DB_EXFIL":
            src = ATTACKER_IPS[0]
            dest_ip, port, proto, name = TARGET_NODES[2]
            event_type = "DB_QUERY_SURGE"
            severity = "CRITICAL"
            payload = f"Unusual query burst: 'SELECT * FROM customer_pii LIMIT 100000' on {name}"
        else: # DECOY_INTERACTION
            src = ATTACKER_IPS[0]
            dest_ip = "10.0.99.10"
            port = 5433
            proto = "PostgreSQL"
            event_type = "DECOY_INTERACTION"
            severity = "CRITICAL"
            payload = "Attacker connected to Adaptive Decoy DB (Port 5433) using stolen honey-credential."

        return TelemetryEvent(
            event_id=f"TEL-{self.counter:05d}",
            timestamp=ts,
            source_ip=src,
            dest_ip=dest_ip,
            dest_port=port,
            protocol=proto,
            event_type=event_type,
            payload_summary=payload,
            severity=severity,
            is_decoy_interaction=(threat_level == "DECOY_INTERACTION")
        )

telemetry_generator = TelemetryGenerator()
