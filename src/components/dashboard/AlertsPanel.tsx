import { Alert } from '@/lib/railway-types';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
}

const severityConfig = {
  critical: { icon: AlertCircle, class: 'border-danger/30 bg-danger/5', iconClass: 'text-danger' },
  warning: { icon: AlertTriangle, class: 'border-warning/30 bg-warning/5', iconClass: 'text-warning' },
  info: { icon: Info, class: 'border-info/30 bg-info/5', iconClass: 'text-info' },
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const active = alerts.filter(a => !a.resolved).slice(-8);

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Alerts</h3>
        {active.length > 0 && (
          <span className="text-xs bg-danger/20 text-danger px-2 py-0.5 rounded-full animate-pulse-glow">
            {active.length} active
          </span>
        )}
      </div>
      <div className="max-h-[240px] overflow-y-auto divide-y divide-border/50">
        <AnimatePresence>
          {active.length === 0 && (
            <div className="p-6 text-center text-muted-foreground text-sm">No active alerts</div>
          )}
          {active.map(alert => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3 border-l-2 ${config.class}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconClass}`} />
                  <div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-display">Tick {alert.timestamp}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
