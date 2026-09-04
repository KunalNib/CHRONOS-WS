import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, Lock, Sliders, Server, Database, Radio, Brain, Crosshair } from 'lucide-react';
import { RoleGuard } from '../auth/RoleGuard';

export interface SecurityLayer {
  level: number;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'ACTIVE' | 'ENFORCED' | 'MONITORED';
  controls: { name: string; status: boolean }[];
  details: string;
}

const SECURITY_LAYERS: SecurityLayer[] = [
  { level: 1, title: 'Network & Perimeter', category: 'Perimeter Security', icon: ShieldCheck, status: 'ACTIVE', controls: [{ name: 'Firewall ACL Boundary', status: true }, { name: 'IDS/IPS Suricata Engine', status: true }, { name: 'VLAN Network Segmentation', status: true }], details: 'Hardware perimeter firewall enforcing strict ingress drop rules for untrusted IP ranges.' },
  { level: 2, title: 'Load Balancer Layer', category: 'Traffic Ingestion', icon: Sliders, status: 'ENFORCED', controls: [{ name: 'Secure TLS 1.3 Transport', status: true }, { name: 'Health Check Probes', status: true }, { name: 'Risk-Aware Dynamic Routing', status: true }], details: 'NGINX reverse proxy with dynamic weight re-allocation based on server threat scores.' },
  { level: 3, title: 'Application Layer', category: 'App Hardening', icon: Server, status: 'ACTIVE', controls: [{ name: 'OAuth2 / JWT Token Validation', status: true }, { name: 'Role-Based Access Control (RBAC)', status: true }, { name: 'WAF SQLi / XSS Filters', status: true }], details: 'FastAPI security middleware checking bearer tokens, scope permissions, and input payloads.' },
  { level: 4, title: 'Host Level', category: 'OS Hardening', icon: Lock, status: 'ENFORCED', controls: [{ name: 'OS Hardening & Least Privilege', status: true }, { name: 'Host HIDS Process Monitoring', status: true }, { name: 'Kernel Audit Trail', status: true }], details: 'Containerized Linux containers operating under read-only root filesystems and non-root users.' },
  { level: 5, title: 'Data Security', category: 'Datastore Protection', icon: Database, status: 'ACTIVE', controls: [{ name: 'AES-256 Data Encryption at Rest', status: true }, { name: 'Strict Connection ACLs', status: true }, { name: 'Cryptographic Hash Integrity', status: true }], details: 'PostgreSQL database running in encrypted storage with restricted socket access.' },
  { level: 6, title: 'Telemetry Ingestion', category: 'Observability', icon: Radio, status: 'MONITORED', controls: [{ name: 'Synthetic Event Validation', status: true }, { name: 'Immutable Audit Logging', status: true }, { name: 'Kafka/Ring Buffer Telemetry', status: true }], details: 'Real-time event streaming pipeline processing 180+ events per second with schema checks.' },
  { level: 7, title: 'AI Prediction Model', category: 'Machine Learning', icon: Brain, status: 'ACTIVE', controls: [{ name: 'Input Vector Normalization', status: true }, { name: 'Confidence Threshold Locks', status: true }, { name: 'Adversarial Input Validation', status: true }], details: 'Sequential LSTM neural network trained on dataset baselines to predict S_(t+1) state spikes.' },
  { level: 8, title: 'Adaptive Defence Engine', category: 'Policy Enforcement', icon: ShieldAlert, status: 'ENFORCED', controls: [{ name: 'Policy Validator Audit Check', status: true }, { name: 'Action Authorization Gate', status: true }, { name: 'Multi-Action Support Rule', status: true }], details: 'Automated policy enforcement engine checking LLM recommendation against POL-001 boundary rules.' },
  { level: 9, title: 'Deception Zone', category: 'Deception Layer', icon: Crosshair, status: 'ACTIVE', controls: [{ name: 'VLAN 99 Decoy Isolation', status: true }, { name: 'No Access to Real Assets', status: true }, { name: 'Controlled Forensic Logging', status: true }], details: 'Controlled honey traps (Decoy DB, Decoy API) operating in complete network isolation.' }
];

export const NetworkSecurityPage: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<SecurityLayer>(SECURITY_LAYERS[0]);

  return (
    <div className="space-y-6 font-mono select-none">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
          Defense-in-Depth Security Matrix (9 Layers)
        </h1>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Multi-layered defense architecture protecting real assets and deceiving adversaries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 9 Security Level Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SECURITY_LAYERS.map((layer) => {
            const IconComp = layer.icon;
            const isSelected = selectedLayer.level === layer.level;
            return (
              <div
                key={layer.level}
                onClick={() => setSelectedLayer(layer)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-105 ${
                  isSelected
                    ? 'bg-slate-800 border-orange-500 shadow-xl'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-orange-400 font-mono">LEVEL 0{layer.level}</span>
                  <span className="badge-green">{layer.status}</span>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <IconComp className="w-4 h-4 text-slate-300" />
                  <span className="font-extrabold text-white text-xs truncate">{layer.title}</span>
                </div>

                <div className="text-[10px] text-slate-500 mt-1">{layer.category}</div>
              </div>
            );
          })}
        </div>

        {/* Selected Layer Inspector Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="font-bold text-white text-xs uppercase">Layer Controls Inspector</span>
            <span className="badge-orange">LEVEL 0{selectedLayer.level}</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="text-lg font-extrabold text-white">{selectedLayer.title}</div>
              <div className="text-slate-400 text-xs mt-0.5">{selectedLayer.category}</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Enforced Controls</div>
              <div className="space-y-2">
                {selectedLayer.controls.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-200">
                    <span className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{c.name}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">VERIFIED</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-slate-300 font-sans text-xs">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Architecture Description</div>
              <p>{selectedLayer.details}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
