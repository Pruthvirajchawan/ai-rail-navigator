import { useMemo } from 'react';
import { Train } from '@/lib/railway-types';
import { Shield, AlertTriangle, CheckCircle2, ArrowRight, Pause, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  trains: Train[];
  conflictsResolved: number;
}

interface DetectedConflict {
  id: string;
  trainA: Train;
  trainB: Train;
  section: string;
  risk: number;
  proximity: number;
  resolution: { holdId: string; passId: string; reason: string };
}

function detectLiveConflicts(trains: Train[]): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];
  const active = trains.filter(t => t.status !== 'arrived');
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      const sA = a.route[a.currentSectionIndex];
      const sA2 = a.route[a.currentSectionIndex + 1];
      const sB = b.route[b.currentSectionIndex];
      const sB2 = b.route[b.currentSectionIndex + 1];
      if (!sA || !sA2 || !sB || !sB2) continue;
      const sameSection = (sA === sB && sA2 === sB2) || (sA === sB2 && sA2 === sB);
      if (sameSection) {
        const proximity = Math.abs(a.progress - b.progress);
        if (proximity < 0.25) {
          const risk = Math.round((1 - proximity / 0.25) * 100);
          const hold = a.priority > b.priority ? a : b;
          const pass = a.priority > b.priority ? b : a;
          conflicts.push({
            id: `${a.id}-${b.id}-${sA}-${sA2}`,
            trainA: a, trainB: b,
            section: `${sA}→${sA2}`,
            risk,
            proximity: Math.round(proximity * 100),
            resolution: {
              holdId: hold.id,
              passId: pass.id,
              reason: `P${pass.priority} (${pass.type}) outranks P${hold.priority} (${hold.type})`,
            },
          });
        }
      }
    }
  }
  return conflicts.sort((a, b) => b.risk - a.risk);
}

export function ConflictResolver({ trains, conflictsResolved }: Props) {
  const conflicts = useMemo(() => detectLiveConflicts(trains), [trains]);
  const critical = conflicts.filter(c => c.risk >= 70).length;
  const moderate = conflicts.filter(c => c.risk >= 30 && c.risk < 70).length;
  const low = conflicts.filter(c => c.risk < 30).length;

  return (
    <div className="glass rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2 flex-wrap">
        <div className="w-7 h-7 rounded bg-accent/10 flex items-center justify-center border border-accent/20">
          <Shield className="w-3.5 h-3.5 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xs uppercase tracking-wider">Conflict Resolver</h3>
          <p className="text-[10px] text-muted-foreground">Auto-resolution · Priority-based arbitration</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-display">
          <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive">{critical} CRIT</span>
          <span className="px-2 py-0.5 rounded bg-warning/10 text-warning">{moderate} MOD</span>
          <span className="px-2 py-0.5 rounded bg-secondary/40 text-muted-foreground">{low} LOW</span>
          <span className="px-2 py-0.5 rounded bg-success/10 text-success">{conflictsResolved} RES</span>
        </div>
      </div>

      {/* Live conflicts */}
      <div className="overflow-y-auto scrollbar-thin max-h-[340px] divide-y divide-border/30">
        <AnimatePresence mode="popLayout">
          {conflicts.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-xs font-semibold text-success">All Clear</div>
              <div className="text-[10px] text-muted-foreground mt-1">No active conflicts detected on the network</div>
            </motion.div>
          )}
          {conflicts.map((c, i) => {
            const sev = c.risk >= 70 ? 'critical' : c.risk >= 30 ? 'moderate' : 'low';
            const sevColor = sev === 'critical' ? 'destructive' : sev === 'moderate' ? 'warning' : 'muted-foreground';
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.04 }}
                className="p-3 hover:bg-secondary/20"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 text-${sevColor} ${sev === 'critical' ? 'animate-pulse' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-[11px] font-semibold">
                        {c.trainA.id} <span className="text-muted-foreground">×</span> {c.trainB.id}
                        <span className="text-[10px] text-muted-foreground font-mono ml-1.5">@ {c.section}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`text-[10px] font-display font-bold text-${sevColor}`}>
                          RISK {c.risk}%
                        </div>
                      </div>
                    </div>

                    {/* Risk bar */}
                    <div className="mt-1.5 h-1 rounded-full bg-secondary/40 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.risk}%` }}
                        className={`h-full bg-${sevColor}`}
                      />
                    </div>

                    {/* Train tags */}
                    <div className="flex items-center gap-1.5 mt-2 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-secondary/40 font-mono">
                        {c.trainA.name} <span className="text-muted-foreground">P{c.trainA.priority}</span>
                      </span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="px-1.5 py-0.5 rounded bg-secondary/40 font-mono">
                        {c.trainB.name} <span className="text-muted-foreground">P{c.trainB.priority}</span>
                      </span>
                    </div>

                    {/* Resolution */}
                    <div className="mt-2 bg-success/5 border border-success/20 rounded p-1.5 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-success shrink-0" />
                      <div className="flex-1 text-[10px]">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="flex items-center gap-0.5 text-warning"><Pause className="w-2.5 h-2.5" /> HOLD</span>
                          <span className="font-mono font-semibold">{c.resolution.holdId}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                          <span className="text-success">PASS</span>
                          <span className="font-mono font-semibold">{c.resolution.passId}</span>
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">{c.resolution.reason}</div>
                      </div>
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
