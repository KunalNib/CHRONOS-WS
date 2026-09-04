import React, { useState } from 'react';
import { Brain, Cpu, Target, HelpCircle, ArrowRight, Activity, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { CurrentSituation } from '../common/CurrentSituation';
import { DetailDrawer, DetailDrawerData } from '../common/DetailDrawer';

export const AIPredictionsPage: React.FC = () => {
  const { currentDemoStepData, judgeDemoStep } = useRealtime();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [drawerData, setDrawerData] = useState<DetailDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const openDrawer = (title: string, summary: string, why: string, evidence: string[]) => {
    setDrawerData({
      title,
      type: 'AI MODEL FORECAST',
      status: '87% CONFIDENCE',
      summary,
      why,
      evidence
    });
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
              AI & Predictions Engine
            </h1>
            <span className="badge-purple">LSTM WORLD MODEL</span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Sequential threat forecasting (S_t → S_t+1) and multi-hypothesis objective estimation
          </p>
        </div>
      </div>

      {/* Situation Summary Banner */}
      <CurrentSituation
        what={`Phase ${judgeDemoStep}/11: Threat Prediction Active`}
        where="Authentication & API Gateway Layer"
        when={new Date().toLocaleTimeString('en-US', { hour12: false })}
        severity={currentDemoStepData.risk}
        why={currentDemoStepData.description}
        whatNext={`Predicted transition to ${currentDemoStepData.predictedStage} with 87% confidence.`}
      />

      {/* Main Prediction Grid: Plain Language Top Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* World Model Forecast */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="font-bold text-white text-xs uppercase flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>World Model Threat State Forecast</span>
            </span>
            <span className="badge-purple">87% CONFIDENCE</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Observed Current State (S_t)</div>
              <div className="font-bold text-slate-200 text-sm">{currentDemoStepData.attackStage}</div>
              <div className="text-[10px] text-slate-400 font-sans">Authentication anomaly threshold exceeded</div>
            </div>

            <div className="flex justify-center text-purple-400">
              <ArrowRight className="w-5 h-5 rotate-90" />
            </div>

            <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-2xl space-y-1">
              <div className="text-[10px] text-purple-400 uppercase font-bold">Predicted Future State (S_t+1)</div>
              <div className="font-bold text-purple-200 text-base">{currentDemoStepData.predictedStage}</div>
              <div className="text-[10px] text-purple-300 font-sans">
                Forecasted horizon: +30 to +60 seconds lateral movement toward PostgreSQL Database
              </div>
            </div>
          </div>

          {/* Plain Language Why Card */}
          <div className="p-3 bg-amber-950/20 rounded-2xl border border-amber-800/40 space-y-1 text-xs">
            <div className="text-amber-400 font-bold uppercase flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why was this prediction made?</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
              The PyTorch sequential model detected 3 matching features: auth failure rate spike, SYN port scan burst, and unusual inter-host gRPC traffic volume.
            </p>
            <button
              onClick={() => openDrawer(
                'AI Threat Prediction Details',
                `Predicted stage: ${currentDemoStepData.predictedStage}`,
                'Matching attack sequence pattern on CTU-13 dataset weights.',
                ['Auth failure rate: >12/2.4s', 'Port scan burst: SYN/8000', 'Inter-host anomaly: +340%']
              )}
              className="mt-2 text-purple-400 hover:text-purple-300 font-bold text-[10px] underline"
            >
              Inspect Model Feature Vector & Evidence Drawer →
            </button>
          </div>
        </div>

        {/* Attacker Objective Hypotheses */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="font-bold text-white text-xs uppercase flex items-center space-x-2">
              <Target className="w-4 h-4 text-orange-400" />
              <span>Multi-Hypothesis Attacker Objectives</span>
            </span>
            <span className="text-[10px] text-slate-400">Bayesian Inference</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-bold">1. Credentials Objective</span>
                <span className="text-orange-400 font-bold font-mono">
                  {Math.round(currentDemoStepData.objectiveCreds * 100)}% (Before: 55% → After: 78%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: `${currentDemoStepData.objectiveCreds * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-bold">2. Database Objective</span>
                <span className="text-amber-400 font-bold font-mono">
                  {Math.round(currentDemoStepData.objectiveDb * 100)}% (Before: 15% → After: 25%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${currentDemoStepData.objectiveDb * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-bold">3. Administrative Access</span>
                <span className="text-rose-400 font-bold font-mono">
                  {Math.round(currentDemoStepData.objectiveAdmin * 100)}% (Baseline: 10%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${currentDemoStepData.objectiveAdmin * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400 font-sans leading-relaxed">
            <strong className="text-orange-400 font-mono">Bayesian Adaptation: </strong>
            Probabilities do not collapse instantly; they evolve as telemetry events arrive, allowing the system to handle multi-stage attacks cleanly.
          </div>
        </div>
      </div>

      {/* Progressive Technical Disclosure Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>PROGRESSIVE TECHNICAL DISCLOSURE (MODEL & VECTOR PARAMETERS)</span>
          </div>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-orange-400" />}
        </button>

        {showTechnicalDetails && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Architecture</div>
              <div className="font-bold text-purple-300">PyTorch LSTM Sequential v1</div>
              <div className="text-[10px] text-slate-400">Input shape: (batch, 10, 16)</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Training Weight Dataset</div>
              <div className="font-bold text-slate-200">CTU-13 / CIC-IDS Benchmark</div>
              <div className="text-[10px] text-slate-400">Loss: 0.0412 • Accuracy: 96.8%</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Sequence Window</div>
              <div className="font-bold text-emerald-400">10 Historical Timesteps</div>
              <div className="text-[10px] text-slate-400">Horizon: +30s to +60s</div>
            </div>
          </div>
        )}
      </div>

      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={drawerData}
      />
    </div>
  );
};
