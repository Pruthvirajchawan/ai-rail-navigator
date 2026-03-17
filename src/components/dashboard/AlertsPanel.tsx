import { Alert } from '@/lib/railway-types';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, Radio, CloudSnow, Signal } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
}

const severityMap = {
  critical: { icon: AlertCircle, border: 'border-l-danger', bg: 'bg-danger/5', iconClass: 'text-danger' },
  warning: { icon: AlertTriangle, border: 'border-l-warning', bg: 'bg-warning/5', iconClass: 'text-warning' },
  info: { icon: Info, border: 'border-l-info', bg: 'bg-info/5', iconClass: 'text-info' },
};

const typeIcons: Record<string, typeof Radio> = {
  conflict: AlertCircle, delay: AlertTriangle, maintenance: Signal,
  congestion: Radio, emergency: AlertCircle, weather: CloudSnow, signal: Signal,
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const active = alerts.filter(a => !a.resolved).slice(-10);

  return (
    <div className="glass rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground">Alerts & Notifications</h3>
        {active.length > 0 && (
          <span className="text-[10px] bg-danger/20 text-danger px-2 py-0.5 rounded-full font-display animate-pulse-glow">
            {active.length} active
          </span>
        )}
      </div>
      <div className="overflow-y-auto scrollbar-thin flex-1 divide-y divide-border/30">
        <AnimatePresence>
          {active.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">All clear — no active alerts</div>
          )}
          {active.map(alert => {
            const sev = severityMap[alert.severity];
            const Icon = typeIcons[alert.type] || sev.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3 border-l-2 ${sev.border} ${sev.bg}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${sev.iconClass}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{alert.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {alert.trainId && <span className="text-[9px] font-display bg-secondary px-1.5 py-0.5 rounded">{alert.trainId}</span>}
                      <span className="text-[9px] text-muted-foreground font-display">T+{alert.timestamp}</span>
                    </div>
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
