# 30-Second Judge Walkthrough & Evaluation Guide

Product: **CHRONOS-WS**  
Tagline: **Predict. Defend. Deceive.**

---

## The 30-Second Evaluation Guarantee

A first-time judge or evaluator evaluating CHRONOS-WS can answer all **12 Core Evaluation Questions** in under 30 seconds directly from the main **Dashboard** or by clicking **`TRIGGER DETERMINISTIC DEMO`**.

---

## 12 Core Questions & Where They Are Answered

| # | Evaluation Question | UI Screen / Component | Where & How It Is Answered |
|---|---|---|---|
| 1 | **What is this application?** | TopBar & Global Context Bar | Header displays **CHRONOS-WS: Predict. Defend. Deceive.** with active mode indicator (`JUDGE DEMO` / `LOCAL LAB`). |
| 2 | **What network is being monitored?** | Dashboard & Network Page | Network Topology section shows active Web Servers, Auth Service, API Gateway, and Decoy DB. |
| 3 | **Is an attack occurring?** | Top Bar & CurrentSituation Card | Overall Risk KPI (`HIGH — 78%`) and Current Situation Card immediately display `ATTACK IN PROGRESS`. |
| 4 | **What is happening right now?** | CurrentSituation Section 1 | Displays: `Credential Access` stage with 12 failed authentication attempts from `192.168.99.150`. |
| 5 | **What does the AI predict next?** | AI Prediction Section 2 | Displays: $S_t \text{ (Credential Access)} \to S_{t+1} \text{ (Lateral Movement)}$ with 87% Confidence (+30s horizon). |
| 6 | **Why does it predict that?** | Evidence Section 3 | Displays: Auth failure spike + SYN port scan burst + unusual east-west communication. |
| 7 | **What does the attacker target?** | Attacker Objectives Section 4 | Displays: Bayesian probabilities (Credentials `78%`, Database `25%`, Admin `10%`) + change `55% → 78%`. |
| 8 | **What action did the system take?** | Defence Decision Section 5 | Displays: `PROTECT` Auth Service, `MONITOR` API Gateway, `DECEIVE` Database. |
| 9 | **Why did it take that action?** | Rationale Section 5 | Explains: Database intent rose to 25% $\to$ Policy validated DECEIVE action to divert exfiltration. |
| 10 | **Is the real asset protected?** | Network & Deception Pages | Displays: PostgreSQL DB `PROTECTED`, traffic diverted to isolated Decoy DB (`VLAN 99, Port 5433`). |
| 11 | **What happened after the action?** | Execution Status Section 6 | Displays: Server B traffic reduced `34% → 10%`, Decoy DB receiving controlled attacker queries. |
| 12 | **Is the system adapting?** | Feedback Loop Section 7 | Displays: Attacker payload captured $\to$ feedback updates network state $\to$ real asset risk drops to `LOW`. |

---

## Recommended Judge Presentation Flow

```
[ LOGIN ]
    ↓
[ DASHBOARD ]  → Observe normal baseline network state
    ↓
[ CLICK "TRIGGER DETERMINISTIC DEMO" ]  → Step through 11 deterministic phases (Seed 42)
    ↓
[ WATCH WORKFLOW STEPPER ]  → OBSERVE → MODEL → PREDICT → ASSESS → DECIDE → ACT → FEEDBACK
    ↓
[ INSPECT ATTACK PATH (/attack-path) ]  → Click node to open Evidence Inspector Drawer
    ↓
[ INSPECT DECEPTION ZONE (/deception) ]  → Verify real asset boundary & honeypot security guarantees
    ↓
[ VIEW REPORTS (/reports) ]  → Review Before → After comparative metrics summary
```
