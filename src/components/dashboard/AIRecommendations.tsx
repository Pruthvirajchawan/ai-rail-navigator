import { AIRecommendation } from '@/lib/railway-types';
import { Lightbulb, Route, Gauge, CalendarClock, Shield, Hand } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
}

const typeIcons = {
  'reroute': Route, 'speed-adjust': Gauge, 'schedule-change': CalendarClock,
  'priority-override': Shield, 'hold': Hand, 'platform-change': CalendarClock,
};

export function AIRecommendations({ recommendations }: AIRecommendationsProps) {
  return (
    <div className="glass rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-accent/10 flex items-center justify-center">
          <Lightbulb className="w-3 h-3 text-accent" />
        </div>
        <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground">AI Recommendations</h3>
      </div>
      <div className="overflow-y-auto scrollbar-thin flex-1 divide-y divide-border/30">
        {recommendations.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">System optimal — no recommendations</div>
        )}
        {recommendations.map((rec, i) => {
          const Icon = typeIcons[rec.type];
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              className="p-3 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 mt-0.5 text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{rec.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{rec.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-success font-display">{rec.impact}</span>
                    <span className="text-[10px] text-muted-foreground font-display">
                      {(rec.confidence * 100).toFixed(0)}% conf
                    </span>
                    {rec.savings > 0 && (
                      <span className="text-[10px] text-cyan font-display">−{rec.savings}min</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
