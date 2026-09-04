import React, { useState } from 'react';
import { Network, Server, Shield, Sliders, Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { DEMO_NODES, NetworkNodeData } from '../../services/demoDataProvider';
import { CurrentSituation } from '../common/CurrentSituation';
import { DetailDrawer, DetailDrawerData } from '../common/DetailDrawer';
import { useRealtime } from '../../context/RealtimeContext';

export const NetworkPage: React.FC = () => {
  const { currentDemoStepData, judgeDemoStep } = useRealtime();
  const [activeTab, setActiveTab] = useState<'topology' | 'security_matrix' | 'load_balancer'>('topology');
  const [selectedNode, setSelectedNode] = useState<NetworkNodeData | null>(DEMO_NODES[5]);
  const [drawerData, setDrawerData] = useState<DetailDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const openNodeDrawer = (node: NetworkNodeData) => {
    setSelectedNode(node);
    setDrawerData({
      title: node.name,
      subtitle: `${node.type} (${node.ip}) — ${node.role}`,
      type: node.type,
      status: node.status,
      summary: `Node ${node.name} is operating at ${node.cpu}% CPU and ${node.memory}% memory.`,
      why: node.status === 'HIGH_RISK'
        ? 'Repeated authentication failure rate anomaly detected.'
        : node.isDecoy
        ? 'Decoy zone honeypot isolated on VLAN 99.'
        : 'Nominal baseline user traffic.',
      evidence: [
        `CPU Load: ${node.cpu}%`,
        `RAM Usage: ${node.memory}%`,
        `Active Connections: ${node.connections}`,
        `IP: ${node.ip}`
      ],
      actionApplied: node.status === 'HIGH_RISK' ? 'PROTECT: Strict Rate Limits' : 'MONITOR: Packet Logging',
      result: 'Node boundary enforced.'
    });
    setDrawerOpen(true);
  };

  const securityLayers = [
    { name: '1. Network Boundary', purpose: 'Perimeter firewall & ACL enforcement', status: 'PROTECTED', risk: 'LOW' },
    { name: '2. Load Balancer', purpose: 'Security-aware dynamic traffic rerouting', status: 'ACTIVE', risk: judgeDemoStep >= 8 ? 'HIGH' : 'LOW' },
    { name: '3. Application Layer', purpose: 'API Gateway WAF & auth rate limiting', status: 'PROTECTED', risk: 'MEDIUM' },
    { name: '4. Host Security', purpose: 'Host-based IDS/IPS telemetry agent', status: 'MONITORED', risk: 'ELEVATED' },
    { name: '5. Data Layer', purpose: 'PostgreSQL relational datastore protection', status: 'PROTECTED', risk: 'LOW' },
    { name: '6. Telemetry Pipeline', purpose: 'Realtime log stream ingestion', status: 'HEALTHY', risk: 'LOW' },
    { name: '7. AI World Model', purpose: 'LSTM temporal threat state forecasting', status: 'ACTIVE', risk: 'LOW' },
    { name: '8. Adaptive Defence', purpose: 'Policy-validated multi-action engine', status: 'ACTIVE', risk: 'LOW' },
    { name: '9. Deception Zone', purpose: 'VLAN 99 isolated honeypot environment', status: judgeDemoStep >= 9 ? 'ACTIVE' : 'STANDBY', risk: 'LOW' }
  ];

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Header & Tab Selector */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-orange-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
              Network Operations & Security Infrastructure
            </h1>
            <span className="badge-orange">TOPOLOGY & DEFENSE</span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Topology canvas, 9-layer defense matrix, and security-aware load balancing
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'topology' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            TOPOLOGY CANVAS
          </button>
          <button
            onClick={() => setActiveTab('security_matrix')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'security_matrix' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            DEFENSE MATRIX (9 LAYERS)
          </button>
          <button
            onClick={() => setActiveTab('load_balancer')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'load_balancer' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            LOAD BALANCER
          </button>
        </div>
      </div>

      <CurrentSituation
        what={`Phase ${judgeDemoStep}/11: Network Infrastructure Monitored`}
        where="Perimeter, App Cluster & Deception Zone"
        when={new Date().toLocaleTimeString('en-US', { hour12: false })}
        severity={currentDemoStepData.risk}
        why="Security-aware load balancer active; traffic allocation dynamically adjusted based on server risk score."
        whatNext="Rerouting high-risk server connections to isolated decoy database."
      />

      {/* Tab 1: Topology Canvas */}
      {activeTab === 'topology' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl bg-canvas-dark">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-white text-xs uppercase">Interactive Topology Node Canvas</span>
            </div>
            <span className="text-[10px] text-slate-500">Click any node to open the Detail Inspector Drawer</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
            {DEMO_NODES.map((node) => (
              <div
                key={node.id}
                onClick={() => openNodeDrawer(node)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all hover:scale-105 select-none ${
                  node.isDecoy
                    ? 'bg-orange-950/30 border-orange-500/50 shadow-lg shadow-orange-950/40'
                    : selectedNode?.id === node.id
                    ? 'bg-slate-800 border-orange-500 shadow-xl'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 truncate">{node.type}</span>
                  <span className="badge-green">{node.status}</span>
                </div>
                <div className="font-bold text-white text-xs mt-1 truncate">{node.name}</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">{node.ip}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Defense-in-Depth Matrix */}
      {activeTab === 'security_matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <span className="font-bold text-white text-xs uppercase flex items-center space-x-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <span>9-Layer Defense-in-Depth Security Matrix</span>
            </span>
            <span className="badge-green">ALL LAYERS ENFORCED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {securityLayers.map((layer, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{layer.name}</span>
                  <span className="badge-green">{layer.status}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">{layer.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security-Aware Load Balancer */}
      {activeTab === 'load_balancer' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <span className="font-bold text-white text-xs uppercase flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Security-Aware Load Balancer Dynamic Rerouting</span>
            </span>
            <span className="badge-amber">SECURITY REROUTING ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">SERVER A (Normal)</span>
                <span className="text-emerald-400">45% Traffic</span>
              </div>
              <div className="text-[11px] text-slate-400">Health: 98% • Risk: LOW</div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[45%]" />
              </div>
              <div className="text-[10px] text-slate-500 font-sans">Rationale: Healthy baseline server</div>
            </div>

            <div className="p-4 bg-amber-950/20 rounded-2xl border border-amber-800/40 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">SERVER B (Suspicious)</span>
                <span className="text-amber-400">10% Traffic (Rerouted)</span>
              </div>
              <div className="text-[11px] text-amber-300">Health: 88% • Risk: HIGH (Auth Anomaly)</div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[10%]" />
              </div>
              <div className="text-[10px] text-amber-400 font-sans">
                Rationale: Traffic reduced from 34% → 10% because security risk increased.
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">SERVER C (Backup)</span>
                <span className="text-blue-400">45% Traffic</span>
              </div>
              <div className="text-[11px] text-slate-400">Health: 99% • Risk: LOW</div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[45%]" />
              </div>
              <div className="text-[10px] text-slate-500 font-sans">Rationale: Received rerouted Server B capacity</div>
            </div>
          </div>
        </div>
      )}

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={drawerData}
      />
    </div>
  );
};
