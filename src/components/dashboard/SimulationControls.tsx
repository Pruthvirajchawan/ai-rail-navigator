import { Play, Pause, RotateCcw, Gauge, Clock, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimulationControlsProps {
  running: boolean;
  speed: number;
  tick: number;
  timeOfDay: string;
  onToggle: () => void;
  onSpeedChange: (s: number) => void;
  onReset: () => void;
}

export function SimulationControls({ running, speed, tick, timeOfDay, onToggle, onSpeedChange, onReset }: SimulationControlsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Live indicator */}
      <div className={`flex items-center gap-1.5 text-[10px] font-display px-2 py-1 rounded-md border ${running ? 'border-success/30 bg-success/5 text-success' : 'border-muted/30 bg-muted/10 text-muted-foreground'}`}>
        <Radio className={`w-3 h-3 ${running ? 'animate-pulse' : ''}`} />
        {running ? 'LIVE' : 'PAUSED'}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-display text-muted-foreground mr-1">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-foreground font-semibold tabular-nums">{timeOfDay}</span>
        <span className="text-border">|</span>
        <span className="tabular-nums">T+{tick}</span>
      </div>
      <Button onClick={onToggle} size="sm"
        className={`gap-1.5 font-display text-[11px] h-7 px-2.5 ${running ? 'bg-danger/90 hover:bg-danger text-destructive-foreground' : 'bg-primary/90 hover:bg-primary text-primary-foreground'}`}
      >
        {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        {running ? 'Pause' : 'Run'}
      </Button>
      <Button onClick={onReset} size="sm" variant="outline" className="gap-1.5 font-display text-[11px] h-7 px-2.5">
        <RotateCcw className="w-3 h-3" /> Reset
      </Button>
      <div className="flex items-center gap-1">
        <Gauge className="w-3 h-3 text-muted-foreground" />
        {[1, 2, 4, 8].map(s => (
          <button key={s} onClick={() => onSpeedChange(s)}
            className={`px-1.5 py-0.5 text-[10px] rounded font-display transition-all ${
              speed === s ? 'bg-primary text-primary-foreground glow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >{s}x</button>
        ))}
      </div>
    </div>
  );
}
