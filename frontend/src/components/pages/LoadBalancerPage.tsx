import React, { useState } from 'react';
import { Sliders, Server, AlertTriangle, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { RoleGuard } from '../auth/RoleGuard';

export const LoadBalancerPage: React.FC = () => {
  const [servers, setServers] = useState([
    { id: 'srv-a', name: 'Server A', cpu: 42, memory: 48, risk: 'LOW', traffic: 45, status: 'HEALTHY' },
    { id: 'srv-b', name: 'Server B', cpu: 51, memory: 64, risk: 'HIGH', traffic: 10, status: 'SUSPICIOUS' },
    { id: 'srv-c', name: 'Server C', cpu: 38, memory: 42, risk: 'LOW', traffic: 45, status: 'HEALTHY' }
  ]);

  return (
    <div className="space-y-6 font-mono select-none">
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
            Security-Aware Load Balancer
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Dynamic weight re-allocation protecting backend servers under elevated risk
          </p>
        </div>

        <span className="badge-green">NGINX ALGORITHM ACTIVE</span>
      </div>

      {/* Routing Reason Banner */}
      <div className="p-4 bg-amber-950/20 border border-amber-800/50 rounded-2xl flex items-center space-x-3 text-xs text-amber-300">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div>
          <strong className="font-bold uppercase text-white font-mono">Routing Allocation Reason: </strong>
          "Server B currently exhibits elevated security risk (78%); traffic allocation automatically reduced from 33% to 10%."
        </div>
      </div>

      {/* Server Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {servers.map((srv) => (
          <div
            key={srv.id}
            className={`p-6 rounded-3xl border space-y-4 shadow-2xl ${
              srv.risk === 'HIGH'
                ? 'bg-rose-950/20 border-rose-900/50'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-orange-400" />
                <span className="font-extrabold text-white text-sm">{srv.name}</span>
              </div>
              <span className={srv.risk === 'HIGH' ? 'badge-red' : 'badge-green'}>
                {srv.risk} RISK
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Traffic Allocation:</span>
                <span className="font-extrabold text-orange-400 text-sm">{srv.traffic}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-orange-500 h-full transition-all duration-500"
                  style={{ width: `${srv.traffic}%` }}
                />
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">CPU</div>
                  <div className="font-bold text-white">{srv.cpu}%</div>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Memory</div>
                  <div className="font-bold text-white">{srv.memory}%</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
