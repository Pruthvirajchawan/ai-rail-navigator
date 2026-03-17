import { scenarios } from '@/lib/railway-data';
import { WhatIfScenario } from '@/lib/railway-types';
import { Beaker, Zap, Cloud, TrafficCone, AlertOctagon, Route } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScenarioPanelProps {
  onRunScenario: (scenario: WhatIfScenario) => void;
}

const typeIcons = {
  delay: AlertOctagon, breakdown: Zap, weather: Cloud,
  congestion: TrafficCone, reroute: Route,
};

const typeColors = {
  delay: 'text-danger border-danger/30 hover:bg-danger/10',
  breakdown: 'text-warning border-warning/30 hover:bg-warning/10',
  weather: 'text-info border-info/30 hover:bg-info/10',
  congestion: 'text-accent border-accent/30 hover:bg-accent/10',
  reroute: 'text-cyan border-cyan/30 hover:bg-cyan/10',
};

export function ScenarioPanel({ onRunScenario }: ScenarioPanelProps) {
  return (
    <div className="glass rounded-lg overflow-hidden">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-info/10 flex items-center justify-center">
          <Beaker className="w-3 h-3 text-info" />
        </div>
        <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground">What-If Scenarios</h3>
      </div>
      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1.5">
        {scenarios.map((s, i) => {
          const Icon = typeIcons[s.type];
          const color = typeColors[s.type];
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onRunScenario(s)}
              className={`p-2.5 rounded-md border text-left transition-all ${color}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-display font-semibold">{s.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{s.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
