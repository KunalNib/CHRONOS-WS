import React, { useState } from 'react';
import { Server, Shield, Activity, RefreshCw, Cpu, Database, Globe, Filter } from 'lucide-react';
import { DEMO_NODES, DEMO_EDGES, NetworkNodeData } from '../../services/demoDataProvider';
import { RoleGuard } from '../auth/RoleGuard';

export const NetworkTopologyPage: React.FC = () => {
  const [nodes, setNodes] = useState<NetworkNodeData[]>(DEMO_NODES);
  const [selectedNode, setSelectedNode] = useState<NetworkNodeData | null>(DEMO_NODES[0]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredNodes = nodes.filter(
    (n) => statusFilter === 'ALL' || n.status === statusFilter
  );

  return (
    <div className="space-y-6 font-mono select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
            Live Network Topology Canvas
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Node-based visual canvas of active defense assets & deception zones
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-orange-400 ml-1.5" />
            {(['ALL', 'HEALTHY', 'SUSPICIOUS', 'HIGH_RISK', 'DECOY'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                  statusFilter === st ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas Node View + Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Node Grid Canvas */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 bg-canvas-dark min-h-[500px] shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs text-slate-400">Topology Canvas Graph • 8 Nodes Active</span>
            <span className="badge-green">LIVE TRAFFIC FLOW</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-105 ${
                    node.isDecoy
                      ? 'bg-orange-950/40 border-orange-500/60 shadow-xl shadow-orange-950/40'
                      : isSelected
                      ? 'bg-slate-800 border-orange-500 shadow-2xl ring-2 ring-orange-500/20'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{node.type}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      node.status === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      node.status === 'SUSPICIOUS' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      node.status === 'HIGH_RISK' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                      'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                    }`}>
                      {node.status}
                    </span>
                  </div>

                  <div className="font-extrabold text-white text-sm mt-2">{node.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{node.ip}</div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                    <div>CPU: <strong className="text-white">{node.cpu}%</strong></div>
                    <div>RAM: <strong className="text-white">{node.memory}%</strong></div>
                    <div>Health: <strong className="text-emerald-400">{node.health}%</strong></div>
                    <div>Conns: <strong className="text-amber-400">{node.connections}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Traffic Edges Info Bar */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Active Inter-Node Traffic Flows</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_EDGES.slice(0, 4).map((e) => (
                <div key={e.id} className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-bold">{e.source} → {e.target}</span>
                  <span className="text-orange-400 font-mono">{e.protocol} ({e.volume})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node Inspector Detailed Side Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <span className="font-bold text-white text-xs uppercase">Asset Inspector</span>
            <Server className="w-4 h-4 text-orange-400" />
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Node Identification</div>
                <div className="text-base font-extrabold text-white">{selectedNode.name}</div>
                <div className="text-slate-400">{selectedNode.role}</div>
                <div className="text-orange-400 font-bold">{selectedNode.ip}</div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Telemetry Metrics</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">CPU Utilization</div>
                    <div className="text-sm font-bold text-amber-400">{selectedNode.cpu}%</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Memory Allocation</div>
                    <div className="text-sm font-bold text-blue-400">{selectedNode.memory}%</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Health Index</div>
                    <div className="text-sm font-bold text-emerald-400">{selectedNode.health}%</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Current Risk</div>
                    <div className="text-sm font-bold text-rose-400">{selectedNode.risk}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Security Controls</div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between"><span>Firewall ACL:</span><span className="text-emerald-400 font-bold">ENFORCED</span></div>
                  <div className="flex justify-between"><span>Deep Packet Audit:</span><span className="text-emerald-400 font-bold">ACTIVE</span></div>
                  <div className="flex justify-between"><span>TLS 1.3 Transport:</span><span className="text-emerald-400 font-bold">VERIFIED</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">Select a node from the canvas to inspect metrics.</div>
          )}
        </div>
      </div>
    </div>
  );
};
