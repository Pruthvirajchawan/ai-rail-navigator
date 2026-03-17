import { Train } from '@/lib/railway-types';
import { Activity, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface OverviewPanelProps {
  activeTrains: number;
  delayedTrains: number;
  onTimePercentage: number;
  efficiency: number;
}

export function OverviewPanel({ activeTrains, delayedTrains, onTimePercentage, efficiency }: OverviewPanelProps) {
  const cards = [
    { label: 'Active Trains', value: activeTrains, icon: Activity, color: 'text-primary' },
    { label: 'Delayed', value: delayedTrains, icon: AlertTriangle, color: 'text-warning' },
    { label: 'On-Time', value: `${onTimePercentage.toFixed(0)}%`, icon: CheckCircle2, color: 'text-success' },
    { label: 'Efficiency', value: `${efficiency.toFixed(0)}%`, icon: Clock, color: 'text-info' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(card => (
        <div key={card.label} className="glass-panel rounded-lg p-4 glow-primary">
          <div className="flex items-center gap-2 mb-2">
            <card.icon className={`w-4 h-4 ${card.color}`} />
            <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">{card.label}</span>
          </div>
          <div className={`text-2xl font-bold font-display ${card.color}`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
