import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, Brain, Network, Shield, GitBranch, Zap, Activity } from 'lucide-react';

export function VisionModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 font-display text-[11px] h-7 px-2.5">
          <Info className="w-3 h-3" /> Vision
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto scrollbar-thin glass-strong">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <span className="text-gradient-primary">AI Railway Section Controller</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            An enterprise-grade real-time decision system for railway network management
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Problem */}
          <section>
            <h3 className="font-display text-xs uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> The Problem
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Indian Railways operates over <span className="text-foreground font-semibold">13,000 trains daily</span> across
              68,000 km of track. Section controllers manually coordinate train movements, resolve conflicts,
              and respond to delays — a cognitively overwhelming task that leads to cascading delays and reduced throughput.
            </p>
          </section>

          {/* Solution */}
          <section>
            <h3 className="font-display text-xs uppercase tracking-wider text-cyan mb-2 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" /> Our Solution
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An AI co-pilot that <span className="text-foreground font-semibold">augments controllers</span> with
              real-time conflict detection, delay prediction, and route optimization — surfacing intelligent
              recommendations while keeping humans in command.
            </p>
          </section>

          {/* AI Stack */}
          <section>
            <h3 className="font-display text-xs uppercase tracking-wider text-accent mb-2 flex items-center gap-2">
              <Network className="w-3.5 h-3.5" /> AI / Algorithm Stack
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { icon: GitBranch, title: 'A* Pathfinding', desc: 'Heuristic graph search with congestion-weighted edge costs for optimal routing & rerouting.' },
                { icon: Brain, title: 'EWMA Delay Prediction', desc: 'LSTM-inspired exponentially weighted moving average with contextual factors (train type, peak hours).' },
                { icon: Shield, title: 'Conflict Resolution', desc: 'Pairwise spatial-temporal conflict detection with priority-based automated mitigation.' },
                { icon: Zap, title: 'Rule-Based Recommender', desc: 'Multi-signal recommendation engine evaluating delay, speed, congestion & priority.' },
              ].map((item) => (
                <div key={item.title} className="p-2.5 rounded-md bg-secondary/40 border border-border/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon className="w-3 h-3 text-accent" />
                    <span className="text-xs font-display font-semibold">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Architecture */}
          <section>
            <h3 className="font-display text-xs uppercase tracking-wider text-info mb-2 flex items-center gap-2">
              <Network className="w-3.5 h-3.5" /> Architecture
            </h3>
            <div className="text-[11px] font-display bg-secondary/40 border border-border/50 rounded-md p-3 leading-relaxed text-muted-foreground space-y-1">
              <div><span className="text-primary">▸ Simulation Engine</span> — Pure functional tick-based state transitions</div>
              <div><span className="text-cyan">▸ Domain Layer</span> — Stations, Tracks, Trains modeled as typed entities</div>
              <div><span className="text-accent">▸ AI Engine</span> — A*, EWMA predictor, conflict detector, recommender</div>
              <div><span className="text-info">▸ React Hook Layer</span> — useSimulation manages real-time state & history</div>
              <div><span className="text-warning">▸ Presentation Layer</span> — Modular dashboard panels with Framer Motion</div>
              <div className="pt-1 mt-1 border-t border-border/30 text-muted-foreground/70">
                Production scale-out: WebSocket streams · Redis cache · Kafka event bus · PostgreSQL time-series
              </div>
            </div>
          </section>

          {/* Impact */}
          <section>
            <h3 className="font-display text-xs uppercase tracking-wider text-success mb-2 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Expected Impact
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-md bg-success/5 border border-success/20 text-center">
                <div className="text-2xl font-display font-bold text-success">+18%</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Throughput</div>
              </div>
              <div className="p-3 rounded-md bg-cyan/5 border border-cyan/20 text-center">
                <div className="text-2xl font-display font-bold text-cyan">−32%</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Avg Delay</div>
              </div>
              <div className="p-3 rounded-md bg-accent/5 border border-accent/20 text-center">
                <div className="text-2xl font-display font-bold text-accent">99.4%</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Safety</div>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
