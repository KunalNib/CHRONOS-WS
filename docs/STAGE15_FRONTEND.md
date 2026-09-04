# STAGE 15 — CHRONOS-WS COMPLETE FRONTEND SUITE

## Overview

**CHRONOS-WS** ("*Predict. Defend. Deceive.*") is a dark-themed Security Operations Center + AI control plane frontend inspired by modern visual workflow node tools.

## Architecture

1. **Authentication & RBAC**:
   - Roles: `ADMIN`, `SOC_ANALYST`, `SECURITY_ENGINEER`, `VIEWER`.
   - Granular permissions: `view_dashboard`, `manage_users`, `execute_defence_action`, `activate_deception`, etc.
   - Context providers: `AuthContext`, `PermissionContext`.
   - Route & Component Guards: `ProtectedRoute`, `RoleGuard`.

2. **Realtime Architecture**:
   - Central multiplexed WebSocket (`RealtimeContext.tsx`).
   - Judge Demo Mode controller providing automated 10-step progression without backend dependence.

3. **Modules & Page Routes**:
   - `/login` — Secure Login Page with seed role selector pills.
   - `/dashboard` — Security Operations Command Center with topology canvas & AI forecast.
   - `/network` — Live Network Topology Canvas with asset inspector.
   - `/network-security` — Defense-in-Depth Matrix (9 layers).
   - `/ai-world-model` — AI World Model $S_t \to S_{t+1}$ temporal prediction & explainability.
   - `/attack-paths` — Attack-Path Prediction Graph & MITRE ATT&CK mapping.
   - `/objectives` — Multi-Hypothesis Objective Inference distribution.
   - `/load-balancer` — Security-Aware Load Balancer dynamic weight re-allocation.
   - `/defence` — Adaptive Defence Engine posture cards.
   - `/deception` — Secure Adaptive Deception Zone (VLAN 99 honey traps).
   - `/telemetry` — Telemetry Stream with category filters.
   - `/reports` — Measured Analytics & JSON/CSV Report Exporter.
   - `/admin/users` — Operator User Provisioning & Access Revocation.
   - `/admin/audit` — Immutable Read-Only System Audit Logs.
   - `/settings` — Model Thresholds & System Configurations.

## Verification & Build Results

- **Frontend Production Build**: `npm run build` passed cleanly in 1.72s.
- **Backend Test Suite**: `pytest -v app/tests/test_all_stages.py` passed 9/9 tests (100% pass rate).
