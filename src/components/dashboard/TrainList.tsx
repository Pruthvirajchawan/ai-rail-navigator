import { Train } from '@/lib/railway-types';
import { motion } from 'framer-motion';

interface TrainListProps {
  trains: Train[];
}

function statusBadge(status: Train['status']) {
  const map = {
    'on-time': { dot: 'status-dot-on-time', text: 'On Time', bg: 'bg-success/10 text-success' },
    'delayed': { dot: 'status-dot-delayed', text: 'Delayed', bg: 'bg-warning/10 text-warning' },
    'stopped': { dot: 'status-dot-critical', text: 'Stopped', bg: 'bg-danger/10 text-danger' },
    'arrived': { dot: 'status-dot-on-time', text: 'Arrived', bg: 'bg-primary/10 text-primary' },
  };
  return map[status];
}

export function TrainList({ trains }: TrainListProps) {
  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Train Status</h3>
      </div>
      <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
        {trains.map((train, i) => {
          const badge = statusBadge(train.status);
          return (
            <motion.div
              key={train.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={badge.dot} />
                <div>
                  <div className="text-sm font-medium">{train.name}</div>
                  <div className="text-xs text-muted-foreground font-display">{train.id} · {train.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{train.speed} km/h</div>
                  {train.delay > 0 && (
                    <div className="text-xs text-warning">+{train.delay.toFixed(1)} min</div>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg}`}>{badge.text}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
