import { AIRecommendation } from '@/lib/railway-types';
import { Lightbulb, Route, Gauge, CalendarClock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
}

const typeIcons = {
  'reroute': Route,
  'speed-adjust': Gauge,
  'schedule-change': CalendarClock,
  'priority-override': Shield,
};

export function AIRecommendations({ recommendations }: AIRecommendationsProps) {
  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-accent" />
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">AI Recommendations</h3>
      </div>
      <div className="max-h-[260px] overflow-y-auto divide-y divide-border/50">
        {recommendations.length === 0 && (
          <div className="p-6 text-center text-muted-foreground text-sm">System running optimally</div>
        )}
        {recommendations.map((rec, i) => {
          const Icon = typeIcons[rec.type];
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{rec.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-success">{rec.impact}</span>
                    <span className="text-xs text-muted-foreground font-display">
                      {(rec.confidence * 100).toFixed(0)}% confidence
                    </span>
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
