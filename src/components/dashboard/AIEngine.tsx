import { useMemo, useState } from 'react';
import { Train, Station, TrackSection } from '@/lib/railway-types';
import { Brain, Cpu, Activity, Sparkles, Route as RouteIcon, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { aStarRoute } from '@/lib/railway-engine';

interface Props {
  trains: Train[];
  stations: Station[];
  tracks: TrackSection[];
}

export function AIEngine({ trains, stations, tracks }: Props) {
  const [origin, setOrigin] = useState(stations[0]?.id ?? '');
  const [destination, setDestination] = useState(stations[stations.length - 1]?.id ?? '');

  const route = useMemo(
    () => (origin && destination && origin !== destination ? aStarRoute(origin, destination, stations, tracks) : []),
    [origin, destination, stations, tracks]
  );

  const routeStats = useMemo(() => {
    if (route.length < 2) return null;
    let distance = 0;
    let avgSpeed = 0;
    let hops = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const t = tracks.find(
        tr => (tr.from === route[i] && tr.to === route[i + 1]) || (tr.from === route[i + 1] && tr.to === route[i])
      );
      if (t) {
        distance += t.distance;
        avgSpeed += t.maxSpeed;
        hops++;
      }
    }
    avgSpeed = hops > 0 ? avgSpeed / hops : 0;
    const eta = avgSpeed > 0 ? (distance / avgSpeed) * 60 : 0; // minutes
    return { distance: Math.round(distance), avgSpeed: Math.round(avgSpeed), eta: Math.round(eta), hops };
  }, [route, tracks]);

  // Delay prediction summary
  const predictions = useMemo(() => {
    const active = trains.filter(t => t.status !== 'arrived');
    const totalPredicted = active.reduce((s, t) => s + t.predictedDelay, 0);
    const trending = active.filter(t => t.predictedDelay > t.delay).length;
    const recovering = active.filter(t => t.predictedDelay < t.delay && t.delay > 1).length;
    return {
      avgPredicted: active.length > 0 ? totalPredicted / active.length : 0,
      trending,
      recovering,
      worstCase: active.sort((a, b) => b.predictedDelay - a.predictedDelay).slice(0, 3),
    };
  }, [trains]);

  const stationMap = useMemo(() => new Map(stations.map(s => [s.id, s.name])), [stations]);

  return (
    <div className="glass rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-cyan/10 flex items-center justify-center border border-cyan/20">
          <Brain className="w-3.5 h-3.5 text-cyan" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xs uppercase tracking-wider">AI Engine</h3>
          <p className="text-[10px] text-muted-foreground">A* routing · EWMA delay forecast · Real-time inference</p>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-cyan font-display">
          <Activity className="w-3 h-3 animate-pulse" /> ACTIVE
        </span>
      </div>

      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* A* Route Planner */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-display uppercase tracking-wider text-muted-foreground">
            <RouteIcon className="w-3 h-3 text-primary" /> A* Route Planner
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-display uppercase text-muted-foreground">From</label>
              <select
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                className="w-full mt-0.5 bg-secondary/30 border border-border rounded px-2 py-1.5 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {stations.map(s => <option key={s.id} value={s.id}>{s.id} — {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-display uppercase text-muted-foreground">To</label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full mt-0.5 bg-secondary/30 border border-border rounded px-2 py-1.5 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {stations.map(s => <option key={s.id} value={s.id}>{s.id} — {s.name}</option>)}
              </select>
            </div>
          </div>

          {route.length > 0 ? (
            <motion.div
              key={route.join('-')}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded p-2 space-y-2"
            >
              <div className="flex items-center gap-1 flex-wrap text-[10px]">
                {route.map((s, i) => (
                  <span key={s} className="flex items-center gap-1">
                    <span className="font-mono font-semibold text-primary">{s}</span>
                    {i < route.length - 1 && <span className="text-muted-foreground">→</span>}
                  </span>
                ))}
              </div>
              {routeStats && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-primary/10 text-[10px]">
                  <div>
                    <div className="text-muted-foreground font-display uppercase">Distance</div>
                    <div className="font-mono font-semibold">{routeStats.distance} km</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground font-display uppercase">Avg Speed</div>
                    <div className="font-mono font-semibold">{routeStats.avgSpeed} km/h</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground font-display uppercase">ETA</div>
                    <div className="font-mono font-semibold text-success">{Math.floor(routeStats.eta / 60)}h {routeStats.eta % 60}m</div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-secondary/20 border border-border rounded p-2 text-[10px] text-muted-foreground text-center">
              {origin === destination ? 'Select different stations' : 'No route found'}
            </div>
          )}
        </div>

        {/* Delay Prediction */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-display uppercase tracking-wider text-muted-foreground">
            <Sparkles className="w-3 h-3 text-cyan" /> EWMA Delay Forecast
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-secondary/20 border border-border rounded p-2 text-center">
              <div className="text-[9px] font-display uppercase text-muted-foreground">Avg Predict</div>
              <div className="text-base font-mono font-bold text-cyan">+{predictions.avgPredicted.toFixed(1)}</div>
              <div className="text-[9px] text-muted-foreground">min</div>
            </div>
            <div className="bg-warning/5 border border-warning/20 rounded p-2 text-center">
              <div className="text-[9px] font-display uppercase text-muted-foreground">Worsening</div>
              <div className="text-base font-mono font-bold text-warning">{predictions.trending}</div>
              <div className="text-[9px] text-muted-foreground">trains</div>
            </div>
            <div className="bg-success/5 border border-success/20 rounded p-2 text-center">
              <div className="text-[9px] font-display uppercase text-muted-foreground">Recovering</div>
              <div className="text-base font-mono font-bold text-success">{predictions.recovering}</div>
              <div className="text-[9px] text-muted-foreground">trains</div>
            </div>
          </div>

          <div className="bg-secondary/10 rounded p-2 space-y-1">
            <div className="text-[9px] font-display uppercase text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" /> Top Risk Predictions
            </div>
            {predictions.worstCase.map(t => (
              <div key={t.id} className="flex items-center justify-between text-[10px]">
                <span className="font-mono truncate flex-1">{t.id} {t.name}</span>
                <span className="font-mono font-semibold text-warning ml-2">+{t.predictedDelay.toFixed(1)}m</span>
              </div>
            ))}
            {predictions.worstCase.length === 0 && (
              <div className="text-[10px] text-muted-foreground text-center py-1">All clear</div>
            )}
          </div>

          <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-display">
            <Cpu className="w-2.5 h-2.5 text-cyan" /> α=0.3 · 20-tick window · contextual factor
          </div>
        </div>
      </div>
    </div>
  );
}
