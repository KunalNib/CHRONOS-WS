# UX Audit & Navigation Redesign Strategy

Product: **CHRONOS-WS**  
Tagline: **Predict. Defend. Deceive.**

---

## 1. Page Audit & Information Architecture Assessment

| Existing Page | Purpose | Data Source | Target User | Current UX Flaws | Recommended Change |
|---|---|---|---|---|---|
| **DashboardPage** (`/dashboard`) | High-level SOC Overview | WebSocket / REST / Demo Provider | All Users | Disconnected KPI cards without context, hard-coded numbers without narrative breakdown. | Overhaul into 7 structured narrative sections answering: What is happening, AI prediction, Why, Attacker objectives, System decision, Execution status, and Live feedback loop. |
| **NetworkTopologyPage** (`/network`) | Canvas Topology Visualizer | `/api/v1/network/topology` | SOC Analyst / Engineer | Isolated from defense status and load balancing. Nodes don't explain risk context when clicked. | Merge into unified `/network` view incorporating Node Canvas Topology, 9-Layer Defense Matrix, and Security-Aware Load Balancer weights. |
| **NetworkSecurityPage** (`/network-security`) | Defense-in-Depth Matrix | `/api/v1/security/layers` | Security Engineer | Standalone list of static checkmarks. Lacks connection to active threats. | Consolidate into `/network` under "Defense-in-Depth Matrix" tab with interactive event breakdowns. |
| **AIWorldModelPage** (`/ai-world-model`) | $S_t \to S_{t+1}$ Neural Predictions | `/api/v1/simulation/status` | Security Engineer / Judge | Complex ML jargon without simple explanation ("Why?"). Disconnected from attacker objectives. | Rename to `/ai` (**AI & Predictions**). Include plain language explanations + progressive technical disclosure + Attacker Objective Hypotheses. |
| **AttackPathPage** (`/attack-paths`) | MITRE ATT&CK Graph | `/api/v1/attack-path/current` | SOC Analyst | Nodes rely on colors alone without explicit status text (`COMPLETED`, `CURRENT`, `PREDICTED`, `BLOCKED`, `DECEIVED`). | Streamline route to `/attack-path`. Add explicit status badges to every node + right-side evidence inspector drawer. |
| **ObjectivesPage** (`/objectives`) | Bayesian Objective Inference | `/api/v1/objectives/current` | SOC Analyst | Fragmented as its own tiny page, forcing judges to switch screens constantly. | Consolidate into `/ai` under "Attacker Objective Hypotheses" and mirror key cards directly on the `/dashboard`. |
| **LoadBalancerPage** (`/load-balancer`) | Security-Aware Rerouting | `/api/v1/load-balancer/status` | DevOps / Network Admin | Shows server weights without explaining *why* traffic was reduced (e.g. Server B risk increase). | Consolidate into `/network` with explicit routing reasons ("Traffic to Server B reduced because security risk increased"). |
| **DefencePage** (`/defence`) | Policy Validation Engine | `/api/v1/defence/current` | Security Engineer | Does not distinguish recommendation from actual execution (`RECOMMENDED` vs `EXECUTING` vs `ACTIVE`). | Overhaul `/defence` with clear visual flow: `Risk → Path → Objective → Load → Decision → Policy Validation → Executing → Active`. |
| **DeceptionPage** (`/deception`) | Honeypot & Decoy Zone | `/api/v1/deception/status` | Security Engineer | Fails to clearly separate Real Assets from Decoy Zone. Doesn't highlight security guarantees (ACLs, zero path to real DB). | Overhaul `/deception` with hard visual boundary between Real Assets & Decoy Zone, Deception Security indicators, and live attacker trap log. |
| **TelemetryPage** (`/telemetry`) | Raw Event Stream | `/api/v1/telemetry/events` | SOC Analyst | Unfiltered log dump without explaining event impact on predictions. | Add tab filters (Network, Auth, Database, Load Balancer, Deception) + click event drawer explaining "Why it matters" and "Prediction impact". |
| **ReportsPage** (`/reports`) | Post-incident Analytics | `/api/v1/reports/summary` | Executive / Analyst | Static metrics without Before $\to$ After comparative metrics. | Update `/reports` to feature Before $\to$ After comparisons (e.g., Risk `42% → 78%`, Server B Traffic `34% → 10%`, Decoy `Inactive → Active`). |

---

## 2. Streamlined Navigation Architecture

To remove cognitive load and eliminate redundant navigation items, primary navigation is consolidated into **8 core pages**:

```
PRIMARY NAVIGATION:
1. Dashboard            (/dashboard)
2. Network              (/network)
3. AI & Predictions     (/ai)
4. Attack Path          (/attack-path)
5. Defence              (/defence)
6. Deception            (/deception)
7. Telemetry            (/telemetry)
8. Reports              (/reports)

ADMINISTRATION:
- User Management       (/admin/users)
- Audit Logs            (/admin/audit)
- Settings              (/settings)
```

> **Legacy Redirects**: Existing links (`/ai-world-model`, `/objectives`, `/load-balancer`, `/attack-paths`, `/network-security`) automatically redirect to their consolidated parent pages so no routes break.
