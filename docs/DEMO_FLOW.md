# 🎭 Judge Demonstration Script: Autonomous AI Cyber-Defense & Adaptive Deception Platform

**Duration**: 5–7 Minutes  
**Theme Aesthetic**: n8n-Themed Dark Obsidian Command Center (`#0F1117`, Coral `#FF6D5A`, Cyan `#00D4B2`, Purple `#7057FF`)

---

## Timeline Breakdown

### ⏱️ Minute 0:00 – 1:00 | The Pitch & System Canvas Overview
* **Visual**: Presenter shows the main Autonomous Command Center dashboard. The dark grid canvas displays a live topology map of a simulated enterprise network (Web Servers, API Gateway, DB Cluster, Internal Workstations).
* **Key Scripting Points**:
  * "Welcome! Traditional SOCs operate on static rules and reactive alerts, leading to mean-time-to-detect measured in days. Today, we present an **Autonomous AI Cybersecurity & Adaptive Deception Platform** built on a closed-loop Data, Intelligence, and Control plane architecture."
  * Highlight the **AI World Model Graph** in real time, showing live green health badges (`#00D4B2`) across all network nodes.

---

### ⏱️ Minute 1:00 – 2:30 | Phase 1: Attack Inception & Data Plane Ingestion
* **Visual**: Presenter launches a multi-stage attack simulation (Reconnaissance + SSH Password Spray on Web Server).
* **UI Action**:
  * The bottom telemetry ticker lights up with OCSF normalized event logs.
  * Node `Web-Server-01` changes status tint from green to warning amber (`#FFC043`).
* **Key Scripting Points**:
  * "Notice how the Data Plane ingests high-frequency telemetry in real-time (<50ms). We are capturing initial reconnaissance without overwhelming human operators with raw alert fatigue."

---

### ⏱️ Minute 2:30 – 4:00 | Phase 2: Intelligence Plane - Path Prediction & Intent Inference
* **Visual**:
  * The AI Intelligence Engine calculates potential lateral movement vectors.
  * Pulsing red/coral path overlays (`#FF6D5A`) highlight the predicted path: `Web-Server-01 ➔ API-Gateway ➔ Crown-Jewel PostgreSQL DB`.
  * The MITRE ATT&CK panel infers adversary objective: **T1078 (Valid Accounts) & T1048 (Exfiltration)** targeting Customer PII Database.
* **Key Scripting Points**:
  * "Our AI World Model graph algorithm doesn't just look at past logs—it predicts the adversary's future moves using probabilistic attack-path prediction and infers their crown-jewel objective."

---

### ⏱️ Minute 4:00 – 5:30 | Phase 3: Control Plane - Adaptive Deception & Containment
* **Visual**:
  * The Autonomous Response Engine automatically deploys **Adaptive Deception**:
    1. Injects a fake database connection string (`honey_db_prod_backup`) into `Web-Server-01` memory.
    2. Dynamically spins up a containerized Decoy DB (`PostgreSQL-Decoy`) on port `5433`.
  * Attacker attempts connection to the honey-db connection string.
* **UI Action**:
  * Deception Trigger Alert pops up: *"Honey-Token Trapped! High Confidence Threat Identified."*
  * The control plane redirects adversary traffic seamlessly into the sandbox trap, while instantly isolating `Web-Server-01` from the real database cluster.
* **Key Scripting Points**:
  * "Instead of a simple IP block that alerts the hacker, we deploy dynamic deception. The attacker believes they succeeded in accessing the database, but they are interacting with a synthetic honey-pot while production data remains untouched."

---

### ⏱️ Minute 5:30 – 7:00 | Phase 4: Closed-Loop Feedback & Impact Summary
* **Visual**:
  * The graph updates instantly: Production assets show green shields, the Decoy node is highlighted in purple containment quarantine.
  * Executive metric summary panel pops up:
    * **Time to Containment**: < 1.2 seconds
    * **Data Loss**: 0 Bytes
    * **Confidence Score**: 100% (Deception validated)
* **Key Scripting Points**:
  * "The feedback loop completes automatically: threat level updated to zero risk for real assets, zero downtime, zero data leakage. This is the future of proactive, autonomous cyber defense."
* **Presenter Closes**: Open for Judge Q&A.
