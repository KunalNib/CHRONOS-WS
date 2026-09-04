export type UserRole = 'ADMIN' | 'SOC_ANALYST' | 'SECURITY_ENGINEER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  lastLogin?: string;
  status: 'ACTIVE' | 'DISABLED' | 'LOCKED';
}

export type Permission =
  | 'manage_users'
  | 'manage_roles'
  | 'view_audit_logs'
  | 'manage_config'
  | 'control_simulation'
  | 'execute_defence_action'
  | 'manage_deception'
  | 'view_deception_status'
  | 'view_dashboard'
  | 'view_network'
  | 'view_telemetry'
  | 'view_ai_model'
  | 'view_attack_paths'
  | 'view_risk'
  | 'view_objectives'
  | 'view_defence'
  | 'view_reports'
  | 'manage_load_balancer'
  | 'manage_security_layers';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'manage_users',
    'manage_roles',
    'view_audit_logs',
    'manage_config',
    'control_simulation',
    'execute_defence_action',
    'manage_deception',
    'view_deception_status',
    'view_dashboard',
    'view_network',
    'view_telemetry',
    'view_ai_model',
    'view_attack_paths',
    'view_risk',
    'view_objectives',
    'view_defence',
    'view_reports',
    'manage_load_balancer',
    'manage_security_layers'
  ],
  SOC_ANALYST: [
    'view_dashboard',
    'view_network',
    'view_telemetry',
    'view_ai_model',
    'view_attack_paths',
    'view_risk',
    'view_objectives',
    'view_defence',
    'view_reports',
    'view_deception_status'
  ],
  SECURITY_ENGINEER: [
    'view_dashboard',
    'view_network',
    'view_telemetry',
    'manage_load_balancer',
    'manage_security_layers',
    'manage_deception',
    'view_deception_status',
    'view_defence',
    'control_simulation'
  ],
  VIEWER: [
    'view_dashboard',
    'view_network',
    'view_attack_paths',
    'view_ai_model',
    'view_reports',
    'view_telemetry'
  ]
};

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
  environment: 'LOCAL DEFENCE LAB' | 'DATASET REPLAY' | 'JUDGE DEMO';
}
