import { useMemo, useState } from 'react';
import { Train, Station } from '@/lib/railway-types';
import { CalendarClock, Clock, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  trains: Train[];
  stations: Station[];
  tick: number;
  timeOfDay: string;
}

interface ScheduleRow {
  trainId: string;
  trainName: string;
  type: Train['type'];
  priority: number;
  origin: string;
  destination: string;
  nextStation: string;
  scheduledArrival: string;
  predictedArrival: string;
  delay: number;
  platform: number;
  status: 'on-time' | 'delayed' | 'critical';
}

function tickToTime(tick: number, baseTick: number): string {
  const totalMin = (tick - baseTick) * 2 + 360; // 06:00 base + 2min/tick
  const h = Math.floor((totalMin / 60) % 24);
  const m = Math.floor(totalMin % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function SchedulingEngine({ trains, stations, tick, timeOfDay }: Props) {
  const [filter, setFilter] = useState<'all' | 'delayed' | 'on-time'>('all');
  const stationMap = useMemo(() => new Map(stations.map(s => [s.id, s])), [stations]);

  const schedule: ScheduleRow[] = useMemo(() => {
    return trains
      .filter(t => t.status !== 'arrived')
      .map(t => {
        const nextIdx = Math.min(t.currentSectionIndex + 1, t.route.length - 1);
        const nextId = t.route[nextIdx];
        const origin = stationMap.get(t.route[0])?.name ?? t.route[0];
        const destination = stationMap.get(t.route[t.route.length - 1])?.name ?? '';
        const nextStation = stationMap.get(nextId)?.name ?? nextId;
        // ETA: ~12 ticks per section baseline, scaled by (1 - progress)
        const ticksToNext = Math.round((1 - t.progress) * 12 * (160 / Math.max(t.speed, 30)));
        const scheduledTickArrival = tick + Math.round((1 - t.progress) * 12);
        const predictedTickArrival = tick + ticksToNext + Math.round(t.predictedDelay / 2);
        const platform = ((parseInt(t.id.slice(-2), 10) || 1) % 12) + 1;
        const status: ScheduleRow['status'] =
          t.delay > 10 ? 'critical' : t.delay > 2 ? 'delayed' : 'on-time';
        return {
          trainId: t.id,
          trainName: t.name,
          type: t.type,
          priority: t.priority,
          origin,
          destination,
          nextStation,
          scheduledArrival: tickToTime(scheduledTickArrival, 0),
          predictedArrival: tickToTime(predictedTickArrival, 0),
          delay: t.delay,
          platform,
          status,
        };
      })
      .sort((a, b) => a.priority - b.priority || a.delay - b.delay);
  }, [trains, stationMap, tick]);

  const filtered = schedule.filter(r =>
    filter === 'all' ? true : filter === 'delayed' ? r.status !== 'on-time' : r.status === 'on-time'
  );

  const stats = {
    total: schedule.length,
    onTime: schedule.filter(s => s.status === 'on-time').length,
    delayed: schedule.filter(s => s.status === 'delayed').length,
    critical: schedule.filter(s => s.status === 'critical').length,
  };

  return (
    <div className="glass rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
            <CalendarClock className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-xs uppercase tracking-wider">Scheduling Engine</h3>
            <p className="text-[10px] text-muted-foreground">Dynamic timetable · Priority-based slot allocation</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-display">
          <span className="px-2 py-0.5 rounded bg-secondary/40 text-muted-foreground">CLOCK {timeOfDay}</span>
          <span className="px-2 py-0.5 rounded bg-success/10 text-success">{stats.onTime} ON-TIME</span>
          <span className="px-2 py-0.5 rounded bg-warning/10 text-warning">{stats.delayed} DELAYED</span>
          <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive">{stats.critical} CRIT</span>
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b border-border/50 flex items-center gap-1">
        {(['all', 'on-time', 'delayed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] font-display px-2 py-1 rounded uppercase tracking-wider transition-colors ${
              filter === f ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-secondary/40'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-y-auto scrollbar-thin max-h-[340px]">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-background/90 backdrop-blur z-10">
            <tr className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">
              <th className="text-left p-2">Train</th>
              <th className="text-left p-2">Route</th>
              <th className="text-left p-2">Next Stop</th>
              <th className="text-center p-2">Sched</th>
              <th className="text-center p-2">ETA</th>
              <th className="text-center p-2">Plat</th>
              <th className="text-center p-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filtered.map((r, i) => (
              <motion.tr
                key={r.trainId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="hover:bg-secondary/20"
              >
                <td className="p-2">
                  <div className="font-mono font-semibold">{r.trainId}</div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[110px]">{r.trainName}</div>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="truncate max-w-[60px]">{r.origin}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[60px]">{r.destination}</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground font-display uppercase">P{r.priority} · {r.type}</div>
                </td>
                <td className="p-2 text-[10px]">{r.nextStation}</td>
                <td className="p-2 text-center font-mono text-muted-foreground">{r.scheduledArrival}</td>
                <td className={`p-2 text-center font-mono font-semibold ${
                  r.status === 'on-time' ? 'text-success' : r.status === 'delayed' ? 'text-warning' : 'text-destructive'
                }`}>
                  {r.predictedArrival}
                  {r.delay > 0 && (
                    <div className="text-[9px] font-display">+{r.delay.toFixed(0)}m</div>
                  )}
                </td>
                <td className="p-2 text-center">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-secondary/50 text-[10px] font-mono">{r.platform}</span>
                </td>
                <td className="p-2 text-center">
                  {r.status === 'on-time' && <CheckCircle2 className="w-3.5 h-3.5 text-success inline" />}
                  {r.status === 'delayed' && <Clock className="w-3.5 h-3.5 text-warning inline" />}
                  {r.status === 'critical' && <AlertTriangle className="w-3.5 h-3.5 text-destructive inline animate-pulse" />}
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground text-xs">No trains match filter</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
