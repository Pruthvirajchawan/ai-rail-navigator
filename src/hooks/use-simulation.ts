import { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationState, WhatIfScenario } from '@/lib/railway-types';
import { createInitialState, simulateTick, applyScenario } from '@/lib/railway-engine';

const HISTORY_KEY = 'railway-history-v1';
type HistoryPoint = { tick: number; onTime: number; avgDelay: number; efficiency: number; throughput: number; congestion: number };

function loadHistory(): HistoryPoint[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(-60) : [];
  } catch { return []; }
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(createInitialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>(loadHistory);

  const tick = useCallback(() => {
    setState(prev => simulateTick(prev));
  }, []);

  useEffect(() => {
    if (state.running) {
      intervalRef.current = setInterval(tick, 700 / state.speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.running, state.speed, tick]);

  useEffect(() => {
    if (state.tick % 4 === 0 && state.tick > 0) {
      setHistory(prev => {
        const next = [...prev.slice(-55), {
          tick: state.tick,
          onTime: state.metrics.onTimePercentage,
          avgDelay: state.metrics.averageDelay,
          efficiency: state.metrics.efficiency,
          throughput: state.metrics.throughput,
          congestion: state.metrics.congestionIndex,
        }];
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore quota */ }
        return next;
      });
    }
  }, [state.tick, state.metrics]);

  const toggleRunning = useCallback(() => setState(prev => ({ ...prev, running: !prev.running })), []);
  const setSpeed = useCallback((speed: number) => setState(prev => ({ ...prev, speed })), []);
  const reset = useCallback(() => {
    setState(createInitialState());
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
  }, []);
  const runScenario = useCallback((scenario: WhatIfScenario) => {
    setState(prev => applyScenario(prev, scenario));
  }, []);

  return { state, history, toggleRunning, setSpeed, reset, runScenario };
}
