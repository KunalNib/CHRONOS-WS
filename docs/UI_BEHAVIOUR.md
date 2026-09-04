# UI Visual Semantics & Component Behaviour Specification

Product: **CHRONOS-WS**  
Tagline: **Predict. Defend. Deceive.**

---

## 1. Strict Color & Visual Semantics

All components strictly follow this color taxonomy. Icons and explicit text status badges are **always mandatory** alongside color to prevent visual ambiguity:

| Status Category | Color Token | Hex / Tailwind | Icon | Meaning / Usage |
|---|---|---|---|---|
| **Healthy / Protected** | GREEN | `emerald-400` / `#10b981` | `CheckCircle2`, `ShieldCheck` | Healthy nodes, protected real assets, policy-approved actions, completed steps. |
| **Suspicious / Warning** | AMBER | `amber-400` / `#f59e0b` | `AlertTriangle`, `Activity` | Suspicious connection spikes, elevated risk, host CPU spikes, monitoring actions. |
| **Critical / Threat** | RED | `rose-400` / `#f43f5e` | `ShieldAlert`, `Flame` | High risk, critical vulnerabilities, active initial access, failed login spikes. |
| **AI / Prediction** | PURPLE | `purple-400` / `#c084fc` | `Brain`, `Cpu` | Neural network prediction $S_{t+1}$, confidence scores, model information. |
| **Deception / Decoy** | ORANGE | `orange-400` / `#fb923c` | `Crosshair`, `Sparkles` | Active honey traps, decoy databases, trapped attacker interactions. |
| **Network Infrastructure**| BLUE | `blue-400` / `#60a5fa` | `Server`, `Globe` | Firewalls, routers, load balancers, normal background traffic. |

---

## 2. Action Execution Lifecycle States

To ensure transparency and eliminate misleading "fake" actions, every system defense decision displays its exact lifecycle stage:

```
[ RECOMMENDED ]  →  [ APPROVED ]  →  [ EXECUTING ]  →  [ ACTIVE ]  →  [ COMPLETED / FAILED ]
```

1. **RECOMMENDED**: LLM Reasoning Engine suggested an action (`PROTECT`, `MONITOR`, or `DECEIVE`).
2. **APPROVED**: Policy Validation Engine checked security policies and approved the action.
3. **EXECUTING**: Backend orchestrator is reconfiguring ACLs, load balancer weights, or honeypot ports.
4. **ACTIVE**: The defence posture or deception zone is actively serving/monitoring traffic.
5. **COMPLETED / FAILED**: Action finished or failed with an explicit error rationale.

---

## 3. Component Interaction Guidelines

* **Right-Side Detail Drawer (`DetailDrawer.tsx`)**:
  Clicking any network node, attack-path node, security layer, telemetry event, or defense action slides open an inspector drawer featuring:
  - `SUMMARY`: High-level plain language description.
  - `STATUS`: Explicit text status badge + timestamp.
  - `WHY`: Root cause and contributing telemetry features.
  - `EVIDENCE`: Raw features or event indicators.
  - `ACTION`: Current defense response or control applied.
  - `RESULT`: Observable outcome on network/attacker.
  - `TIMELINE`: Mini sequence of recent state changes.

* **Before $\to$ After Comparative Metrics**:
  Wherever state changes occur, display explicitly:
  `Credentials Objective: 55% → 78%`
  `Server B Traffic: 34% → 10%`
  `Decoy DB: INACTIVE → ACTIVE`

* **Empty, Loading, & Error Handling**:
  - **Loading**: Skeleton placeholders with meaningful text ("Calculating neural future state $S_{t+1}$...").
  - **Empty State**: Informative fallback instructions ("Network is stable. Start Judge Demo to observe threat progression.").
  - **Error State**: User-actionable advice ("WebSocket disconnected. Retrying connection...").
