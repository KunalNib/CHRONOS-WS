import React from 'react';
import { useRealtime } from '../../context/RealtimeContext';

export interface WorkflowStage {
  id: string;
  label: string;
  stepNum: number;
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  { id: 'OBSERVE', label: 'OBSERVE', stepNum: 1 },
  { id: 'MODEL', label: 'MODEL', stepNum: 3 },
  { id: 'PREDICT', label: 'PREDICT', stepNum: 4 },
  { id: 'ASSESS', label: 'ASSESS', stepNum: 6 },
  { id: 'DECIDE', label: 'DECIDE', stepNum: 7 },
  { id: 'ACT', label: 'ACT', stepNum: 9 },
  { id: 'FEEDBACK', label: 'FEEDBACK', stepNum: 11 }
];

export const SystemStoryIndicator: React.FC = () => {
  const { judgeDemoStep } = useRealtime();

  const getStageStatus = (stageStepNum: number) => {
    if (judgeDemoStep > stageStepNum + 1) return 'COMPLETED';
    if (judgeDemoStep >= stageStepNum - 1 && judgeDemoStep <= stageStepNum + 1) return 'ACTIVE';
    return 'UPCOMING';
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 font-mono text-xs select-none shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-slate-400 font-bold uppercase">System Defence Cycle:</span>
          <span className="text-orange-400 font-bold bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/40 text-[10px]">
            OBSERVE → PREDICT → DEFEND → DECEIVE → LEARN
          </span>
        </div>

        {/* Stepper Flow */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-0.5">
          {WORKFLOW_STAGES.map((stage, idx) => {
            const status = getStageStatus(stage.stepNum);
            return (
              <React.Fragment key={stage.id}>
                <div
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    status === 'ACTIVE'
                      ? 'bg-orange-500 text-white border-orange-400 shadow-md ring-1 ring-orange-400/50 animate-pulse'
                      : status === 'COMPLETED'
                      ? 'bg-slate-800 text-emerald-400 border-slate-700'
                      : 'bg-slate-950 text-slate-600 border-slate-900'
                  }`}
                  title={`Stage ${stage.label}`}
                >
                  <span>{stage.label}</span>
                  {status === 'COMPLETED' && <span className="text-emerald-400">✓</span>}
                  {status === 'ACTIVE' && <span className="text-white">●</span>}
                  {status === 'UPCOMING' && <span className="text-slate-600">○</span>}
                </div>

                {idx < WORKFLOW_STAGES.length - 1 && (
                  <span className="text-slate-700 text-[10px]">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
