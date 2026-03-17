import { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationState, WhatIfScenario } from '@/lib/railway-types';
import { createInitialState, simulateTick, applyScenario } from '@/lib/railway-engine';

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(createInitialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [history, setHistory] = useState<{ tick: number; onTime: number; avgDelay: number; efficiency: number; throughput: number; congestion: number }[]>([]);

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
      setHistory(prev => [...prev.slice(-55), {
        tick: state.tick,
        onTime: state.metrics.onTimePercentage,
        avgDelay: state.metrics.averageDelay,
        efficiency: state.metrics.efficiency,
        throughput: state.metrics.throughput,
        congestion: state.metrics.congestionIndex,
      }]);
    }
  }, [state.tick, state.metrics]);

  const toggleRunning = useCallback(() => setState(prev => ({ ...prev, running: !prev.running })), []);
  const setSpeed = useCallback((speed: number) => setState(prev => ({ ...prev, speed })), []);
  const reset = useCallback(() => { setState(createInitialState()); setHistory([]); }, []);
  const runScenario = useCallback((scenario: WhatIfScenario) => {
    setState(prev => applyScenario(prev, scenario));
  }, []);

  return { state, history, toggleRunning, setSpeed, reset, runScenario };
}
