# Frontend Data Mapping & Backend Integration Contract

Product: **CHRONOS-WS**  
Tagline: **Predict. Defend. Deceive.**

This document maps every major UI component to its underlying FastAPI backend REST endpoint, WebSocket event, fallback data provider, and RBAC permission requirement.

---

## Data Source Mapping Table

| UI Component | Displayed Data | Backend Source Endpoint | Update Method | Fallback Data Provider | Required Permission |
|---|---|---|---|---|---|
| **GlobalContextBar** | Environment, Mode, Network Status, Threat Index, Timestamp | `/api/v1/simulation/status` | WebSocket (`ws_manager`) | `RealtimeContext` | `view_dashboard` |
| **SystemStoryIndicator** | Workflow Stepper (`OBSERVE` $\to$ `FEEDBACK`) | `/api/v1/judge-demo/status` | WebSocket (`ws_manager`) | `DEMO_STAGES` | `view_dashboard` |
| **CurrentSituation Card** | Threat Level, Attack Stage, Affected Assets, Narrative Summary | `/api/v1/simulation/status` | WebSocket / REST GET | `DEMO_STAGES[current]` | `view_dashboard` |
| **AI Prediction Section** | $S_t \to S_{t+1}$, Horizon (+30s), Confidence Score | `/api/v1/simulation/status` | WebSocket / REST GET | `world_model` preset | `view_ai_model` |
| **Attacker Objectives Card** | Bayesian Probabilities ($P(\text{Creds}), P(\text{DB}), P(\text{Admin})$) | `/api/v1/objectives/current` | REST GET / WebSocket | `demoDataProvider.ts` | `view_objectives` |
| **Network Topology Canvas** | Node Health, CPU, Memory, IP, Role, Decoy Flag | `/api/v1/network/topology` | REST GET / WebSocket | `DEMO_NODES` / `DEMO_EDGES` | `view_network` |
| **Defense Matrix Tab** | 9-Layer Security Status & Active Controls | `/api/v1/security/layers` | REST GET | `SECURITY_LAYERS` mock | `view_network` |
| **Load Balancer Panel** | Server A/B/C Traffic %, Weights, Health, Reroute Rationale | `/api/v1/load-balancer/status` | REST GET / WebSocket | `LOAD_BALANCER_DEFAULT` | `view_network` |
| **Attack Path Graph** | ATT&CK Tactic Nodes, Node Status (`COMPLETED`, `PREDICTED`) | `/api/v1/attack-path/current` | REST GET / WebSocket | `DEMO_ATTACK_PATH` | `view_attack_paths` |
| **Defence Engine Pipeline** | Recommendation, Policy Validation, Action (`PROTECT`, `DECEIVE`) | `/api/v1/defence/current` | REST GET / WebSocket | `DEMO_DEFENCE_ACTIONS` | `view_defence` |
| **Deception Zone Card** | Decoy DB Health, Security Guarantees (ACLs), Attacker Logs | `/api/v1/deception/status` | REST POST / GET | `DEMO_DECEPTION_STATE` | `view_deception_status` |
| **Telemetry Event Table** | Filterable Log Stream, Severity, Impact Breakdown Drawer | `/api/v1/telemetry/events` | WebSocket Stream | `DEMO_TELEMETRY_LOGS` | `view_telemetry` |
| **Reports Analytics View** | Before $\to$ After Comparative Analytics | `/api/v1/reports/summary` | REST GET | `DEMO_REPORTS_SUMMARY` | `view_reports` |
| **Deterministic Judge Demo Trigger** | Fixed-seed (42) scenario progression controller | `/api/v1/judge-demo/trigger` | REST POST | Local stepper timer | `view_dashboard` |

---

## WebSocket Event Contract

All realtime updates are streamed over `ws://localhost:8000/api/v1/ws/telemetry` using standard event JSON structures:

```json
{
  "event_type": "telemetry_update | network_state_update | prediction_update | attack_path_update | objective_update | risk_update | defence_update | load_balancer_update | deception_update | feedback_update",
  "timestamp": "2026-09-04T04:15:00Z",
  "payload": {
    "step": 4,
    "title": "4 / 11 FUTURE PREDICTION",
    "risk": "HIGH",
    "attack_stage": "Credential Access",
    "predicted_stage": "Lateral Movement",
    "confidence": 0.87,
    "objectives": { "credentials": 0.78, "database": 0.25, "administrative_access": 0.10 }
  }
}
```
