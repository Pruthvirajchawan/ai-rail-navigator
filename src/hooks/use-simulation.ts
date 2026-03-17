import { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationState } from '@/lib/railway-types';
import { createInitialState, simulateTick } from '@/lib/railway-engine';

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(createInitialState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [history, setHistory] = useState<{ tick: number; onTime: number; avgDelay: number; efficiency: number }[]>([]);

  const tick = useCallback(() => {
    setState(prev => {
      const next = simulateTick(prev);
      return next;
    });
  }, []);

  useEffect(() => {
    if (state.running) {
      intervalRef.current = setInterval(tick, 800 / state.speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.running, state.speed, tick]);

  // Record history every 5 ticks
  useEffect(() => {
    if (state.tick % 5 === 0 && state.tick > 0) {
      setHistory(prev => [...prev.slice(-50), {
        tick: state.tick,
        onTime: state.metrics.onTimePercentage,
        avgDelay: state.metrics.averageDelay,
        efficiency: state.metrics.efficiency,
      }]);
    }
  }, [state.tick, state.metrics]);

  const toggleRunning = useCallback(() => {
    setState(prev => ({ ...prev, running: !prev.running }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const reset = useCallback(() => {
    setState(createInitialState());
    setHistory([]);
  }, []);

  return { state, history, toggleRunning, setSpeed, reset };
}
