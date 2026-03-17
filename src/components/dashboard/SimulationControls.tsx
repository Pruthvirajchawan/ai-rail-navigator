import { Play, Pause, RotateCcw, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimulationControlsProps {
  running: boolean;
  speed: number;
  tick: number;
  onToggle: () => void;
  onSpeedChange: (s: number) => void;
  onReset: () => void;
}

export function SimulationControls({ running, speed, tick, onToggle, onSpeedChange, onReset }: SimulationControlsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button
        onClick={onToggle}
        size="sm"
        variant={running ? 'destructive' : 'default'}
        className="gap-1.5 font-display text-xs"
      >
        {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        {running ? 'Pause' : 'Resume'}
      </Button>
      <Button onClick={onReset} size="sm" variant="outline" className="gap-1.5 font-display text-xs">
        <RotateCcw className="w-3.5 h-3.5" />
        Reset
      </Button>
      <div className="flex items-center gap-1.5 ml-2">
        <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
        {[1, 2, 4].map(s => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-0.5 text-xs rounded font-display transition-colors ${
              speed === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground font-display ml-auto">TICK: {tick}</span>
    </div>
  );
}
