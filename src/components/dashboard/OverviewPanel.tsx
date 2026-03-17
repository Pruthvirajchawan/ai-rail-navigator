import { Activity, Clock, AlertTriangle, CheckCircle2, Users, Gauge, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface OverviewPanelProps {
  activeTrains: number;
  delayedTrains: number;
  onTimePercentage: number;
  efficiency: number;
  totalPassengers: number;
  avgSpeed: number;
  safetyScore: number;
  congestionIndex: number;
}

export function OverviewPanel(props: OverviewPanelProps) {
  const cards = [
    { label: 'Active Trains', value: props.activeTrains, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Delayed', value: props.delayedTrains, icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'On-Time Rate', value: `${props.onTimePercentage}%`, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Efficiency', value: `${props.efficiency}%`, icon: Zap, color: 'text-cyan', bg: 'bg-cyan/10' },
    { label: 'Passengers', value: props.totalPassengers.toLocaleString(), icon: Users, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Avg Speed', value: `${props.avgSpeed}`, icon: Gauge, color: 'text-foreground', bg: 'bg-secondary' },
    { label: 'Safety', value: `${props.safetyScore}%`, icon: Shield, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Congestion', value: `${props.congestionIndex}%`, icon: Clock, color: props.congestionIndex > 50 ? 'text-danger' : 'text-warning', bg: props.congestionIndex > 50 ? 'bg-danger/10' : 'bg-warning/10' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="glass rounded-lg p-3"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className={`w-6 h-6 rounded-md ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
            </div>
          </div>
          <div className={`text-lg font-bold font-display ${card.color} leading-none`}>{card.value}</div>
          <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-display">{card.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
