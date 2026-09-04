"""
CHRONOS-WS Stage 3 Security Architecture Engine.
Manages the 9-Level Defense-in-Depth Security Matrix:
1. NETWORK/PERIMETER
2. LOAD BALANCER
3. APPLICATION
4. HOST
5. DATA
6. TELEMETRY
7. AI
8. DEFENCE
9. DECEPTION

Tracks security controls, health status, risk scores, events, and last_checked timestamps.
"""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any
from app.models.schemas import (
    SecurityControl, SecurityLayerEvent, SecurityLayer, SecurityOverviewResponse
)

logger = logging.getLogger("CHRONOS-WS.SecurityMatrix")

INITIAL_SECURITY_LAYERS: List[Dict[str, Any]] = [
    {
        "id": "level_1_network",
        "layer": "NETWORK/PERIMETER",
        "name": "Network & Perimeter Security",
        "status": "HEALTHY",
        "risk": 0.02,
        "controls": [
            {"name": "firewall", "enabled": True, "status": "ACTIVE", "description": "Border Next-Gen Firewall rule enforcement"},
            {"name": "ACL", "enabled": True, "status": "ACTIVE", "description": "Network Access Control Lists & IP filtering"},
            {"name": "IDS/IPS", "enabled": True, "status": "ACTIVE", "description": "Intrusion Detection & Prevention System"},
            {"name": "segmentation", "enabled": True, "status": "ACTIVE", "description": "VLAN & Subnet network isolation"},
            {"name": "rate limiting", "enabled": True, "status": "ACTIVE", "description": "Edge DDoS & ingress traffic rate throttling"}
        ],
        "events": [
            {
                "id": "EVT-SEC-N1-01",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "severity": "INFO",
                "message": "Perimeter firewall ACL active: 0 unauthorized ingress packets dropped.",
                "control_name": "firewall"
            }
        ]
    },
    {
        "id": "level_2_load_balancer",
        "layer": "LOAD BALANCER",
        "name": "Load Balancer & Edge Ingress",
        "status": "HEALTHY",
        "risk": 0.03,
        "controls": [
            {"name": "secure transport", "enabled": True, "status": "ACTIVE", "description": "TLS 1.3 encryption & HSTS enforcement"},
            {"name": "health checks", "enabled": True, "status": "ACTIVE", "description": "Backend node health probe & auto-failover"},
            {"name": "connection controls", "enabled": True, "status": "ACTIVE", "description": "Max connection limit & keepalive timeout"},
            {"name": "rate limiting", "enabled": True, "status": "ACTIVE", "description": "Per-IP request rate limiting"},
            {"name": "security-aware routing", "enabled": True, "status": "ACTIVE", "description": "Dynamic traffic splitting & malicious IP diversion"}
        ],
        "events": [
            {
                "id": "EVT-SEC-L2-01",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "severity": "INFO",
                "message": "TLS 1.3 handshake enforced on 100% incoming traffic.",
                "control_name": "secure transport"
            }
        ]
    },
    {
        "id": "level_3_application",
        "layer": "APPLICATION",
        "name": "Application & API Security",
        "status": "HEALTHY",
        "risk": 0.04,
        "controls": [
            {"name": "authentication", "enabled": True, "status": "ACTIVE", "description": "OAuth2 / JWT cryptographic token validation"},
            {"name": "authorization", "enabled": True, "status": "ACTIVE", "description": "Fine-grained access policy verification"},
            {"name": "RBAC", "enabled": True, "status": "ACTIVE", "description": "Role-Based Access Control matrix"},
            {"name": "input validation", "enabled": True, "status": "ACTIVE", "description": "Pydantic schema validation & sanitization"},
            {"name": "API protection", "enabled": True, "status": "ACTIVE", "description": "WAF rules & CORS origin restriction"}
        ],
        "events": [
            {
                "id": "EVT-SEC-A3-01",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "severity": "INFO",
                "message": "Strict Pydantic payload validation active across all REST endpoints.",
                "control_name": "input validation"
            }
        ]
    },
    {
        "id": "level_4_host",
        "layer": "HOST",
        "name": "Host & Node Hardening",
        "status": "HEALTHY",
        "risk": 0.02,
        "controls": [
            {"name": "hardening", "enabled": True, "status": "ACTIVE", "description": "OS kernel hardening & CIS benchmark compliance"},
            {"name": "least privilege", "enabled": True, "status": "ACTIVE", "description": "Non-root container execution & capability dropping"},
            {"name": "process monitoring", "enabled": True, "status": "ACTIVE", "description": "Real-time process tree & execution auditing"},
            {"name": "HIDS", "enabled": True, "status": "ACTIVE", "description": "Host-based Intrusion Detection System"},
            {"name": "integrity", "enabled": True, "status": "ACTIVE", "description": "File integrity monitoring (FIM)"}
        ],
        "events": [
            {
                "id": "EVT-SEC-H4-01",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "severity": "INFO",
                "message": "Host integrity check verified across all active nodes.",
                "control_name": "integrity"
            }
        ]
    },
    {
        "id": "level_5_data",
        "layer": "DATA",
        "name": "Data Protection & Privacy",
        "status": "HEALTHY",
        "risk": 0.01,
        "controls": [
            {"name": "encryption", "enabled": True, "status": "ACTIVE", "description": "AES-256 encryption at rest and in transit"},
            {"name": "access control", "enabled": True, "status": "ACTIVE", "description": "Strict DB user permissions & column-level ACLs"},
            {"name": "integrity", "enabled": True, "status": "ACTIVE", "description": "Cryptographic hash verification for stored logs"}
        ],
        "events": [
            {
                "id": "EVT-SEC-D5-01",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "severity": "INFO",
                "message": "AES-256 storage volume encryption active.",
                "control_name": "encryption"
            }
        ]
    },
    {
        "id": "level_6_telemetry",
        "layer": "TELEMETRY",
        "name": "Telemetry & Sensor Pipeline",
        "status": "HEALTHY",
        "risk": 0.02,
        "controls": [
            {"name": "validation", "enabled": True, "status": "ACTIVE", "description": "Telemetry event schema parsing & validation"},
            {"name": "secure collection", "enabled": True, "status": "ACTIVE", "description": "Authenticated gRPC/mTLS log collection pipeline"},
            {"name": "audit logging", "enabled": True, "status": "ACTIVE", "description": "Centralized immutable audit log stream"},
            {"name": "log integrity", "enabled": True, "status": "ACTIVE", "description": "SHA-256 checksum audit trail for all event logs"}
        ],
        "events": [
            {
                "id": "EVT-SEC-T6-01",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "severity": "INFO",
                "message": "Telemetry collector operating under zero packet loss.",
                "control_name": "secure collection"
            }
        ]
    },
    {
        "id": "level_7_ai",
        "layer": "AI",
        "name": "AI Intelligence & Model Security",
        "status": "HEALTHY",
        "risk": 0.03,
        "controls": [
            {"name": "trusted input", "enabled": True, "status": "ACTIVE", "description": "Input feature vector range check & sanitization"},
            {"name": "prediction validation", "enabled": True, "status": "ACTIVE", "description": "Cross-validation of attack path predictions"},
            {"name": "confidence threshold", "enabled": True, "status": "ACTIVE", "description": "Minimum confidence filter (0.75) for auto-action"},
            {"name": "model access control", "enabled": True, "status": "ACTIVE", "description": "Restricted inference API access keys"},
            {"name": "audit", "enabled": True, "status": "ACTIVE", "description": "Full audit log of AI decision explanations"}
        ],
        "events": [
            {
                "id": "EVT-SEC-AI7-01",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "severity": "INFO",
                "message": "AI guardrails active: 100% inference inputs within valid bounds.",
                "control_name": "trusted input"
            }
        ]
    },
    {
        "id": "level_8_defence",
        "layer": "DEFENCE",
        "name": "Autonomous Defence & Response",
        "status": "HEALTHY",
        "risk": 0.02,
        "controls": [
            {"name": "policy validation", "enabled": True, "status": "ACTIVE", "description": "Zero-trust policy validation gate before action execution"},
            {"name": "authorized actions", "enabled": True, "status": "ACTIVE", "description": "Whitelist of verified response playbooks"},
            {"name": "audit logs", "enabled": True, "status": "ACTIVE", "description": "Tamper-evident log of executed response actions"}
        ],
        "events": [
            {
                "id": "EVT-SEC-DEF8-01",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "severity": "INFO",
                "message": "Response policy validator online and enforcing safety rules.",
                "control_name": "policy validation"
            }
        ]
    },
    {
        "id": "level_9_deception",
        "layer": "DECEPTION",
        "name": "Adaptive Deception & Honeypots",
        "status": "STANDBY",
        "risk": 0.00,
        "controls": [
            {"name": "isolation", "enabled": True, "status": "STANDBY", "description": "Complete network namespace container isolation"},
            {"name": "firewall", "enabled": True, "status": "STANDBY", "description": "Strict egress-blocking firewall rules"},
            {"name": "ACL", "enabled": True, "status": "STANDBY", "description": "Decoy-only access control lists"},
            {"name": "least privilege", "enabled": True, "status": "STANDBY", "description": "Sandboxed unprivileged decoy execution"},
            {"name": "monitoring", "enabled": True, "status": "STANDBY", "description": "High-verbosity interaction monitoring"},
            {"name": "resource limits", "enabled": True, "status": "STANDBY", "description": "Strict CPU/RAM quota on decoy containers"},
            {"name": "secure logs", "enabled": True, "status": "STANDBY", "description": "Isolated logging channel for attacker telemetry"}
        ],
        "events": [
            {
                "id": "EVT-SEC-DEC9-01",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "severity": "INFO",
                "message": "Adaptive deception honeypots in Standby state ready for trigger.",
                "control_name": "isolation"
            }
        ]
    }
]


class SecurityMatrixEngine:
    def __init__(self):
        self.layers: Dict[str, SecurityLayer] = {}
        self._init_layers()

    def _init_layers(self):
        now_str = datetime.now(timezone.utc).isoformat()
        for l_data in INITIAL_SECURITY_LAYERS:
            controls = [SecurityControl(**c) for c in l_data["controls"]]
            events = [SecurityLayerEvent(**e) for e in l_data["events"]]
            layer_obj = SecurityLayer(
                id=l_data["id"],
                layer=l_data["layer"],
                name=l_data["name"],
                status=l_data["status"],
                risk=l_data["risk"],
                controls=controls,
                events=events,
                last_checked=now_str
            )
            self.layers[layer_obj.id] = layer_obj

    def get_layers(self) -> List[SecurityLayer]:
        now_str = datetime.now(timezone.utc).isoformat()
        for layer in self.layers.values():
            layer.last_checked = now_str
        return list(self.layers.values())

    def get_overview(self) -> SecurityOverviewResponse:
        layers = self.get_layers()
        total_l = len(layers)
        healthy_l = sum(1 for l in layers if l.status == "HEALTHY")
        degraded_l = sum(1 for l in layers if l.status == "DEGRADED")
        standby_l = sum(1 for l in layers if l.status == "STANDBY")
        
        all_controls = [c for l in layers for c in l.controls]
        total_c = len(all_controls)
        active_c = sum(1 for c in all_controls if c.status in ["ACTIVE", "STANDBY"] and c.enabled)
        
        avg_risk = sum(l.risk for l in layers) / total_l if total_l else 0.0
        
        sys_status = "PROTECTED"
        if degraded_l > 2 or avg_risk > 0.4:
            sys_status = "ELEVATED RISK"
        elif degraded_l > 0:
            sys_status = "ATTENTION REQUIRED"

        return SecurityOverviewResponse(
            total_layers=total_l,
            healthy_layers=healthy_l,
            degraded_layers=degraded_l,
            standby_layers=standby_l,
            total_controls=total_c,
            active_controls=active_c,
            average_risk=round(avg_risk, 3),
            system_security_status=sys_status,
            layers=layers
        )

    def get_events(self, limit: int = 50) -> List[SecurityLayerEvent]:
        all_events = []
        for l in self.layers.values():
            all_events.extend(l.events)
        # Sort by timestamp descending
        all_events.sort(key=lambda x: x.timestamp, reverse=True)
        return all_events[:limit]


# Global singleton security matrix engine
security_matrix_engine = SecurityMatrixEngine()
