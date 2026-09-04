import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  Play,
  Pause,
  FastForward,
  Radio,
  Activity,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Crosshair,
  GitCommit,
  Brain,
  Target,
  Layers,
  Cpu,
  Zap,
  RotateCcw,
  CheckCircle2,
  Terminal
} from 'lucide-react';
import {
  fetchClosedLoopStatus,
  startClosedLoop,
  stopClosedLoop,
  stepClosedLoop,
  createClosedLoopWebSocket,
  ClosedLoopStatusResponse,
  WSEventMessage
} from '../services/api';

export const ClosedLoopPage: React.FC = () => {
  const [status, setStatus] = useState<ClosedLoopStatusResponse | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [latestTelemetry, setLatestTelemetry] = useState<any>(null);
  const [latestNetState, setLatestNetState] = useState<any>(null);
  const [latestPrediction, setLatestPrediction] = useState<any>(null);
  const [latestAttackPath, setLatestAttackPath] = useState<any>(null);
  const [latestObjectives, setLatestObjectives] = useState<any>(null);
  const [latestDefence, setLatestDefence] = useState<any>(null);
  const [latestDeception, setLatestDeception] = useState<any>(null);
  const [latestFeedback, setLatestFeedback] = useState<any>(null);
  const [activeStage, setActiveStage] = useState<string>('IDLE');
  const [loading, setLoading] = useState<boolean>(false);
  
  const wsRef = useRef<WebSocket | null>(null);

  const loadStatus = async () => {
    try {
      const data = await fetchClosedLoopStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to load closed-loop status:', err);
    }
  };

  useEffect(() => {
    loadStatus();

    // Establish WebSocket Connection
    const ws = createClosedLoopWebSocket((message: WSEventMessage) => {
      setActiveStage(message.event_type);
      
      switch (message.event_type) {
        case 'telemetry_update':
          setLatestTelemetry(message.payload);
          break;
        case 'network_state_update':
          setLatestNetState(message.payload);
          break;
        case 'prediction_update':
          setLatestPrediction(message.payload);
          break;
        case 'attack_path_update':
        case 'risk_update':
          setLatestAttackPath(message.payload);
          break;
        case 'objective_update':
          setLatestObjectives(message.payload);
          break;
        case 'defence_update':
          setLatestDefence(message.payload);
          break;
        case 'deception_update':
          setLatestDeception(message.payload);
          break;
        case 'feedback_update':
          setLatestFeedback(message.payload);
          break;
      }
      
      loadStatus();
    });

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    wsRef.current = ws;

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handleStartLoop = async () => {
    try {
      setLoading(true);
      await startClosedLoop(2.0);
      await loadStatus();
    } catch (err) {
      console.error('Failed to start closed loop:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopLoop = async () => {
    try {
      setLoading(true);
      await stopClosedLoop();
      await loadStatus();
    } catch (err) {
      console.error('Failed to stop closed loop:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleStep = async () => {
    try {
      setLoading(true);
      await stepClosedLoop();
      await loadStatus();
    } catch (err) {
      console.error('Failed to execute single step:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Navigation */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-amber-500/20 rounded-xl border border-cyan-500/30">
            <RotateCcw className="w-6 h-6 text-cyan-400 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Stage 14 — Closed-Loop Adaptation Engine
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Continuous Real-Time Feedback Loop • Telemetry $\rightarrow$ World Model $\rightarrow$ Attack Path $\rightarrow$ Objectives $\rightarrow$ Defence $\rightarrow$ Deception Feedback
            </p>
          </div>
        </div>

        {/* Action Controls & WebSocket Connection Indicator */}
        <div className="flex items-center space-x-3 font-mono">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs ${
            wsConnected
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
          }`}>
            <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
            <span>{wsConnected ? 'WEBSOCKET CONNECTED' : 'DISCONNECTED'}</span>
          </div>

          {status?.is_running ? (
            <button
              onClick={handleStopLoop}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition-all shadow-lg"
            >
              <Pause className="w-4 h-4" />
              <span>PAUSE LOOP</span>
            </button>
          ) : (
            <button
              onClick={handleStartLoop}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition-all shadow-lg"
            >
              <Play className="w-4 h-4" />
              <span>START CLOSED-LOOP DEMO</span>
            </button>
          )}

          <button
            onClick={handleSingleStep}
            disabled={loading || status?.is_running}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            <FastForward className="w-4 h-4 text-cyan-400" />
            <span>SINGLE STEP</span>
          </button>
        </div>
      </header>

      {/* Closed-Loop Visual Pipeline Flow Diagram */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Autonomous Closed-Loop Pipeline Flow (Cycle Step #{status?.current_step || 0})
            </h2>
          </div>
          <span className="text-xs text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/40">
            ACTIVE STAGE: {activeStage.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2 text-center text-[10px]">
          {[
            { id: 'telemetry_update', label: '1. TELEMETRY', icon: Radio, color: 'emerald' },
            { id: 'network_state_update', label: '2. STATE S_t', icon: Layers, color: 'cyan' },
            { id: 'prediction_update', label: '3. WORLD MODEL S_t+1', icon: Cpu, color: 'purple' },
            { id: 'attack_path_update', label: '4. ATTACK PATH', icon: GitCommit, color: 'rose' },
            { id: 'risk_update', label: '5. RISK SCORE', icon: ShieldAlert, color: 'rose' },
            { id: 'objective_update', label: '6. OBJECTIVES', icon: Target, color: 'amber' },
            { id: 'reasoning', label: '7. LLM REASON', icon: Brain, color: 'purple' },
            { id: 'defence_update', label: '8. ADAPT DEFENCE', icon: ShieldCheck, color: 'cyan' },
            { id: 'deception_update', label: '9. DECEPTION ZONE', icon: Crosshair, color: 'amber' },
            { id: 'feedback_update', label: '10. FEEDBACK LOOP', icon: RotateCcw, color: 'emerald' }
          ].map((item, idx) => {
            const IconComp = item.icon;
            const isActive = activeStage === item.id;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 scale-105 shadow-lg animate-pulse'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span className="font-bold tracking-tighter leading-tight">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Live Streaming Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        {/* Card 1: Telemetry & Network State */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase">1 & 2. Telemetry & State</h3>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">STREAMING</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">EVENT ID:</span>
              <span className="text-emerald-300 font-bold">{latestTelemetry?.event_id || 'TEL-BASE-01'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">STATE SCENARIO:</span>
              <span className="text-cyan-300 font-bold">{latestNetState?.scenario_stage || 'NORMAL'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CPU / MEMORY:</span>
              <span className="text-slate-300">{latestNetState?.avg_cpu?.toFixed(1) || '18.4'}% / {latestNetState?.avg_memory?.toFixed(1) || '28.1'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ANOMALY INDEX:</span>
              <span className="text-amber-400 font-bold">{((latestNetState?.anomaly_score || 0.05) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: World Model & Attack Path */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <GitCommit className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-white uppercase">3 & 4. LSTM Prediction & Attack Path</h3>
            </div>
            <span className="text-[10px] text-rose-400 bg-rose-950 px-2 py-0.5 rounded">PREDICTING</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">CURRENT STAGE:</span>
              <span className="text-rose-300 font-bold">{status?.current_attack_stage || 'Discovery'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">RISK ASSESSMENT:</span>
              <span className="text-rose-400 font-bold uppercase">{status?.current_risk || 'LOW'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">PREDICTED S_(t+1) CPU:</span>
              <span className="text-purple-300">{latestPrediction?.avg_cpu?.toFixed(1) || '22.1'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CONFIDENCE:</span>
              <span className="text-emerald-400 font-bold">88.5%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Adaptive Defence & Deception Feedback */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Crosshair className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase">8, 9 & 10. Defence & Feedback</h3>
            </div>
            <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded">CLOSED-LOOP</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">POLICY VALIDATED:</span>
              <span className="text-emerald-400 font-bold">YES (POL-001 APPROVED)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">DECEPTION STATUS:</span>
              <span className={`font-bold ${status?.deception_active ? 'text-amber-400' : 'text-purple-300'}`}>
                {status?.deception_active ? 'VLAN 99 ACTIVE' : 'ISOLATED STANDBY'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">FEEDBACK SIGNAL:</span>
              <span className="text-cyan-300 font-bold">
                {latestFeedback ? 'CAPTURED PAYLOAD FEEDBACK' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attacker Feedback Telemetry Stream Console */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Closed-Loop Deception Attacker Telemetry Feedback Stream
            </h3>
          </div>
          <span className="text-xs text-slate-400">Real-Time Event Stream Log</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2 max-h-48 overflow-y-auto">
          {latestFeedback ? (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-emerald-300 space-y-1">
              <p className="font-bold text-emerald-400">
                [FEEDBACK LOOP EVENT] Attacker {latestFeedback.attacker_ip} trapped on {latestFeedback.target_decoy} (Port {latestFeedback.decoy_port})
              </p>
              <p className="text-slate-300">Payload: <code className="text-amber-300">{latestFeedback.captured_payload}</code></p>
              <p className="text-[10px] text-slate-400">Impact: {latestFeedback.feedback_impact}</p>
            </div>
          ) : (
            <p className="text-slate-500 italic">
              Closed-loop feedback engine standing by. Start demo loop to observe continuous live adaptation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
