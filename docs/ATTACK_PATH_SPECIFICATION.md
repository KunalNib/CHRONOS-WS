# 🗺️ CHRONOS-WS Stage 8 — Attack-Path Prediction Engine & MITRE ATT&CK Visualizer

This specification documents the architecture, prediction logic, MITRE ATT&CK mappings, and API endpoints for the **Stage 8 Attack-Path Prediction Engine**.

---

## 1. System Architecture & Progression Chain

The Stage 8 Engine correlates multiple telemetry and ML inputs to predict multi-stage cyber attack progression:

```
Inputs                                   Prediction Core                        Outputs
┌──────────────────────────┐          ┌──────────────────────────┐          ┌────────────────────────────┐
│ Current NetworkState S_t │          │                          │          │ Dynamic AttackPath Graph   │
│ Predicted State S_(t+1)  ├─────────►│  AttackPathPrediction    ├─────────►│ MITRE ATT&CK Node Statuses │
│ Recent Telemetry Stream  │          │  Engine (Stage 8)        │          │ Stage Progression Chain    │
│ Asset Topology & Risk    │          │                          │          │ Affected Assets & Risk     │
└──────────────────────────┘          └──────────────────────────┘          └────────────────────────────┘
```

---

## 2. MITRE ATT&CK Progression Chain Mapping

The engine dynamically evaluates telemetry and LSTM world model prediction inputs to populate 6 tactical attack nodes:

| Stage ID | Stage Label | MITRE Tactic | MITRE Technique | Default Target Asset |
|----------|-------------|--------------|------------------|----------------------|
| `node_recon` | Discovery / Recon | `TA0043: Reconnaissance` | `T1595: Active Scanning` | `edge_firewall_01` |
| `node_disc` | Discovery | `TA0007: Discovery` | `T1046: Network Service Discovery` | `load_balancer_01` |
| `node_init` | Initial Access | `TA0001: Initial Access` | `T1190: Exploit Public-Facing App` | `web_server_01` |
| `node_cred` | Credential Access | `TA0006: Credential Access` | `T1110: Brute Force` | `auth_service_01` |
| `node_lat` | Lateral Movement | `TA0008: Lateral Movement` | `T1021: Remote Services` | `database_01` |
| `node_exfil` | Collection & Exfiltration | `TA0010: Exfiltration` | `T1041: Exfiltration Over C2` | `backup_storage_01` |

---

## 3. Dynamic Node Status Logic

Each node is assigned a status based on current threat risk and telemetry evidence:
- **`COMPLETED`**: Historical attack steps prior to active stage.
- **`ACTIVE`**: Current active stage of compromise based on live telemetry evidence.
- **`PREDICTED`**: Imminent next stage forecasted by Stage 7 LSTM predicted state ($\hat{S}_{t+1}$).
- **`POTENTIAL`**: Downstream future attack progression steps.

---

## 4. REST API Reference

### `GET /api/v1/attack-path/current`
Returns current dynamic `AttackPath` object containing node array, edge probabilities, and prediction header.

### `GET /api/v1/attack-path/prediction`
Returns `AttackStagePrediction` summary (current stage, predicted next stage, future progression chain, confidence score, risk level, affected assets, and model version).
