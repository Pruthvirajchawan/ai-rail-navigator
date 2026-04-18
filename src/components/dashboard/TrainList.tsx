import { Train } from '@/lib/railway-types';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TrainListProps {
  trains: Train[];
}

const statusConfig = {
  'on-time': { dot: 'dot-on-time', text: 'On Time', bg: 'bg-success/10 text-success', bar: 'bg-success' },
  'delayed': { dot: 'dot-delayed', text: 'Delayed', bg: 'bg-warning/10 text-warning', bar: 'bg-warning' },
  'stopped': { dot: 'dot-stopped', text: 'Stopped', bg: 'bg-danger/10 text-danger', bar: 'bg-danger' },
  'arrived': { dot: 'dot-arrived', text: 'Arrived', bg: 'bg-cyan/10 text-cyan', bar: 'bg-cyan' },
  'departed': { dot: 'dot-on-time', text: 'Departed', bg: 'bg-primary/10 text-primary', bar: 'bg-primary' },
};

export function TrainList({ trains }: TrainListProps) {
  const sorted = [...trains].sort((a, b) => a.priority - b.priority);

  return (
    <div className="glass rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground">Train Registry</h3>
        </div>
        <span className="text-[10px] text-muted-foreground font-display">{trains.length} trains</span>
      </div>
      <div className="divide-y divide-border/50 overflow-y-auto scrollbar-thin flex-1">
        {sorted.map((train, i) => {
          const cfg = statusConfig[train.status];
          const totalSegments = Math.max(1, train.route.length - 1);
          const journeyProgress = Math.min(100, ((train.currentSectionIndex + train.progress) / totalSegments) * 100);
          return (
            <motion.div
              key={train.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-2.5 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cfg.dot} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{train.name}</div>
                    <div className="text-[10px] text-muted-foreground font-display flex items-center gap-1.5">
                      <span>{train.id}</span>
                      <span className="text-border">·</span>
                      <span className="uppercase">{train.type}</span>
                      <span className="text-border">·</span>
                      <span className="text-accent">P{train.priority}</span>
                      <span className="text-border">·</span>
                      {train.direction === 'down' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-display text-muted-foreground">{train.speed} <span className="text-[9px]">km/h</span></div>
                    {train.delay > 0 && (
                      <div className="text-[10px] text-warning font-display">+{train.delay.toFixed(0)}m</div>
                    )}
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${cfg.bg} font-display`}>{cfg.text}</span>
                </div>
              </div>
              {/* Journey progress bar */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[9px] font-display text-muted-foreground/70 w-10 truncate">{train.route[0]}</span>
                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden relative">
                  <motion.div
                    className={`h-full ${cfg.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${journeyProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  {/* Station markers */}
                  {train.route.map((_, idx) => {
                    if (idx === 0 || idx === train.route.length - 1) return null;
                    const pos = (idx / totalSegments) * 100;
                    return (
                      <div key={idx} className="absolute top-0 w-px h-full bg-background/50" style={{ left: `${pos}%` }} />
                    );
                  })}
                </div>
                <span className="text-[9px] font-display text-muted-foreground/70 w-10 truncate text-right">{train.route[train.route.length - 1]}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
