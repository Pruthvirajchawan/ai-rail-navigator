import { Activity, Clock, AlertTriangle, CheckCircle2, Users, Gauge, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedNumber } from './AnimatedNumber';
import { Sparkline } from './Sparkline';

interface OverviewPanelProps {
  activeTrains: number;
  delayedTrains: number;
  onTimePercentage: number;
  efficiency: number;
  totalPassengers: number;
  avgSpeed: number;
  safetyScore: number;
  congestionIndex: number;
  history?: { onTime: number; efficiency: number; congestion: number; throughput: number }[];
}

export function OverviewPanel(props: OverviewPanelProps) {
  const h = props.history ?? [];
  const onTimeSeries = h.map(x => x.onTime);
  const effSeries = h.map(x => x.efficiency);
  const congSeries = h.map(x => x.congestion);
  const throughSeries = h.map(x => x.throughput);

  const cards = [
    { label: 'Active Trains', value: props.activeTrains, icon: Activity, color: 'text-primary', bg: 'bg-primary/10', spark: throughSeries, sparkColor: 'hsl(var(--primary))' },
    { label: 'Delayed', value: props.delayedTrains, icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', spark: [], sparkColor: 'hsl(var(--warning))' },
    { label: 'On-Time Rate', value: props.onTimePercentage, suffix: '%', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', spark: onTimeSeries, sparkColor: 'hsl(var(--success))' },
    { label: 'Efficiency', value: props.efficiency, suffix: '%', icon: Zap, color: 'text-cyan', bg: 'bg-cyan/10', spark: effSeries, sparkColor: 'hsl(var(--cyan))' },
    { label: 'Passengers', value: props.totalPassengers, icon: Users, color: 'text-info', bg: 'bg-info/10', format: (n: number) => Math.round(n).toLocaleString(), spark: [], sparkColor: 'hsl(var(--info))' },
    { label: 'Avg Speed', value: props.avgSpeed, suffix: ' km/h', icon: Gauge, color: 'text-foreground', bg: 'bg-secondary', spark: [], sparkColor: 'hsl(var(--foreground))' },
    { label: 'Safety', value: props.safetyScore, suffix: '%', icon: Shield, color: 'text-success', bg: 'bg-success/10', spark: [], sparkColor: 'hsl(var(--success))' },
    { label: 'Congestion', value: props.congestionIndex, suffix: '%', icon: Clock, color: props.congestionIndex > 50 ? 'text-danger' : 'text-warning', bg: props.congestionIndex > 50 ? 'bg-danger/10' : 'bg-warning/10', spark: congSeries, sparkColor: 'hsl(var(--danger))' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="glass rounded-lg p-3 relative overflow-hidden group hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className={`w-6 h-6 rounded-md ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
            </div>
            {card.spark && card.spark.length > 1 && (
              <Sparkline data={card.spark} color={card.sparkColor} height={14} />
            )}
          </div>
          <div className={`text-lg font-bold font-display ${card.color} leading-none`}>
            <AnimatedNumber value={card.value} suffix={card.suffix} format={card.format} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-display">{card.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
