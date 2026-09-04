import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createClosedLoopWebSocket, WSEventMessage } from '../services/api';
import { DEMO_STAGES, JudgeDemoStep } from '../services/demoDataProvider';
import { useAuth } from './AuthContext';

interface RealtimeContextType {
  wsConnected: boolean;
  activeStage: string;
  judgeDemoActive: boolean;
  judgeDemoStep: number;
  currentDemoStepData: JudgeDemoStep;
  startJudgeDemo: () => void;
  stopJudgeDemo: () => void;
  resetJudgeDemo: () => void;
  triggerDeterministicDemo: (seed?: number) => void;
  setJudgeDemoStepIndex: (idx: number) => void;
  recentWsEvents: WSEventMessage[];
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { environment, setEnvironment } = useAuth();
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<string>('telemetry_update');
  const [judgeDemoActive, setJudgeDemoActive] = useState<boolean>(false);
  const [judgeDemoStep, setJudgeDemoStep] = useState<number>(1);
  const [recentWsEvents, setRecentWsEvents] = useState<WSEventMessage[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<any>(null);

  // Initialize central shared WebSocket connection
  useEffect(() => {
    const ws = createClosedLoopWebSocket((message: WSEventMessage) => {
      setActiveStage(message.event_type);
      setRecentWsEvents((prev) => [message, ...prev.slice(0, 49)]);
    });

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    wsRef.current = ws;

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Handle Judge Demo automated stepping timer (11 steps)
  useEffect(() => {
    if (judgeDemoActive) {
      timerRef.current = setInterval(() => {
        setJudgeDemoStep((prev) => {
          const next = prev >= 11 ? 1 : prev + 1;
          const stepData = DEMO_STAGES[next - 1];
          setActiveStage(stepData.activeStage);
          return next;
        });
      }, 2500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [judgeDemoActive]);

  const startJudgeDemo = () => {
    setEnvironment('JUDGE DEMO');
    setJudgeDemoActive(true);
    setJudgeDemoStep(1);
    setActiveStage(DEMO_STAGES[0].activeStage);
  };

  const triggerDeterministicDemo = (seed: number = 42) => {
    fetch(`http://localhost:8000/api/v1/judge-demo/trigger?seed=${seed}`, { method: 'POST' }).catch(() => {});
    setEnvironment('JUDGE DEMO');
    setJudgeDemoActive(true);
    setJudgeDemoStep(1);
    setActiveStage(DEMO_STAGES[0].activeStage);
  };

  const stopJudgeDemo = () => {
    setJudgeDemoActive(false);
    setEnvironment('LOCAL DEFENCE LAB');
  };

  const resetJudgeDemo = () => {
    fetch('http://localhost:8000/api/v1/judge-demo/reset', { method: 'POST' }).catch(() => {});
    setJudgeDemoStep(1);
    setActiveStage(DEMO_STAGES[0].activeStage);
  };

  const setJudgeDemoStepIndex = (stepNum: number) => {
    if (stepNum >= 1 && stepNum <= 11) {
      setJudgeDemoStep(stepNum);
      setActiveStage(DEMO_STAGES[stepNum - 1].activeStage);
    }
  };

  const currentDemoStepData = DEMO_STAGES[judgeDemoStep - 1] || DEMO_STAGES[0];

  return (
    <RealtimeContext.Provider
      value={{
        wsConnected,
        activeStage,
        judgeDemoActive,
        judgeDemoStep,
        currentDemoStepData,
        startJudgeDemo,
        stopJudgeDemo,
        resetJudgeDemo,
        triggerDeterministicDemo,
        setJudgeDemoStepIndex,
        recentWsEvents
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = (): RealtimeContextType => {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return ctx;
};
