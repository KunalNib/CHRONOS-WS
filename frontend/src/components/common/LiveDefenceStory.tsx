import React from 'react';
import { History, Sparkles, AlertTriangle, ShieldCheck, Crosshair, RefreshCw } from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';

export interface StoryEvent {
  time: string;
  stage: string;
  text: string;
  type: 'info' | 'threat' | 'ai' | 'defence' | 'deception' | 'feedback';
}

export const LiveDefenceStory: React.FC = () => {
  const { judgeDemoStep, currentDemoStepData, recentWsEvents } = useRealtime();

  const getStoryEvents = (): StoryEvent[] => {
    // Generate narrative timeline dynamically based on step sequence
    const events: StoryEvent[] = [
      { time: '10:42:00', stage: '01 NORMAL', text: 'Baseline network traffic flowing across Web Server 01 & API Gateway.', type: 'info' }
    ];

    if (judgeDemoStep >= 2) {
      events.push({ time: '10:42:05', stage: '02 TELEMETRY', text: 'Suspicious connection burst detected from external IP 192.168.99.150.', type: 'threat' });
    }
    if (judgeDemoStep >= 3) {
      events.push({ time: '10:42:08', stage: '03 STATE', text: 'Authentication failure anomaly threshold exceeded on Auth Service (12 attempts / 2.4s).', type: 'threat' });
    }
    if (judgeDemoStep >= 4) {
      events.push({ time: '10:42:12', stage: '04 PREDICTION', text: 'PyTorch LSTM Neural Model forecasts elevated lateral movement risk (+30s).', type: 'ai' });
    }
    if (judgeDemoStep >= 5) {
      events.push({ time: '10:42:15', stage: '05 ATTACK PATH', text: 'MITRE ATT&CK T1078 (Valid Accounts) path identified targeting PostgreSQL DB.', type: 'ai' });
    }
    if (judgeDemoStep >= 6) {
      events.push({ time: '10:42:18', stage: '06 OBJECTIVE', text: 'Bayesian Objective Engine updated Credential Access intent probability to 78%.', type: 'ai' });
    }
    if (judgeDemoStep >= 7) {
      events.push({ time: '10:42:21', stage: '07 DEFENCE', text: 'Adaptive Defence Engine issued validated multi-action policy: PROTECT + DECEIVE.', type: 'defence' });
    }
    if (judgeDemoStep >= 8) {
      events.push({ time: '10:42:24', stage: '08 LOAD BALANCER', text: 'NGINX Load Balancer dynamically throttles high-risk Server B traffic from 33% to 10%.', type: 'defence' });
    }
    if (judgeDemoStep >= 9) {
      events.push({ time: '10:42:26', stage: '09 DECEPTION', text: 'Adaptive Decoy Database activated on isolated VLAN 99 honey port 5433.', type: 'deception' });
    }
    if (judgeDemoStep >= 10) {
      events.push({ time: '10:42:28', stage: '10 INTERACTION', text: 'Attacker exfiltration trapped in Decoy Zone; query logged with ZERO real DB impact.', type: 'deception' });
    }
    if (judgeDemoStep >= 11) {
      events.push({ time: '10:42:30', stage: '11 FEEDBACK', text: 'Closed-loop telemetry feedback updates state estimator; real asset risk lowered to LOW.', type: 'feedback' });
    }

    return events.reverse();
  };

  const storyList = getStoryEvents();

  const getEventBadge = (type: StoryEvent['type']) => {
    switch (type) {
      case 'threat':
        return <span className="badge-red">THREAT ANOMALY</span>;
      case 'ai':
        return <span className="badge-purple">AI FORECAST</span>;
      case 'defence':
        return <span className="badge-green">DEFENCE ACTION</span>;
      case 'deception':
        return <span className="badge-orange">DECOY TRAP</span>;
      case 'feedback':
        return <span className="badge-blue">CLOSED LOOP</span>;
      default:
        return <span className="badge-blue">BASELINE</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl font-mono select-none">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-orange-400" />
          <h3 className="font-bold text-white text-xs uppercase">Live Defence Narrative Story</h3>
        </div>
        <span className="text-[10px] text-slate-500">Real-Time Event Stream</span>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {storyList.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl border transition-all text-xs ${
              idx === 0
                ? 'bg-slate-950 border-orange-500/50 shadow-md ring-1 ring-orange-500/30'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-500">{item.time}</span>
                <span className="text-[10px] font-bold text-slate-300">{item.stage}</span>
              </div>
              {getEventBadge(item.type)}
            </div>
            <p className="text-xs text-slate-200 font-sans mt-1.5 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
