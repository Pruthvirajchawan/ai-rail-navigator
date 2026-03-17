import { Station, TrackSection, Train } from '@/lib/railway-types';
import { useMemo } from 'react';

interface TrackVisualizationProps {
  stations: Station[];
  tracks: TrackSection[];
  trains: Train[];
}

const trackColor = (status: TrackSection['status']) => {
  switch (status) {
    case 'congested': return 'hsl(var(--danger))';
    case 'occupied': return 'hsl(var(--warning))';
    case 'maintenance': return 'hsl(var(--muted-foreground))';
    default: return 'hsl(var(--border))';
  }
};

const trainColor = (status: Train['status']) => {
  switch (status) {
    case 'delayed': return 'hsl(var(--warning))';
    case 'stopped': return 'hsl(var(--danger))';
    case 'arrived': return 'hsl(var(--cyan))';
    default: return 'hsl(var(--primary))';
  }
};

export function TrackVisualization({ stations, tracks, trains }: TrackVisualizationProps) {
  const stationMap = useMemo(() => new Map(stations.map(s => [s.id, s])), [stations]);

  const trainPositions = useMemo(() => {
    return trains.filter(t => t.status !== 'arrived').map(train => {
      const fromId = train.route[train.currentSectionIndex];
      const toId = train.route[train.currentSectionIndex + 1];
      if (!fromId || !toId) return null;
      const from = stationMap.get(fromId);
      const to = stationMap.get(toId);
      if (!from || !to) return null;
      return {
        ...train,
        x: from.x + (to.x - from.x) * train.progress,
        y: from.y + (to.y - from.y) * train.progress,
      };
    }).filter(Boolean) as (Train & { x: number; y: number })[];
  }, [trains, stationMap]);

  return (
    <div className="glass rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground">Live Network Map</h3>
        <div className="flex items-center gap-3 text-[9px] font-display text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success" />On-Time</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning" />Delayed</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-danger" />Stopped</span>
        </div>
      </div>
      <div className="p-2 flex-1 relative">
        <svg viewBox="0 0 800 420" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Grid pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.3" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="800" height="420" fill="url(#grid)" />

          {/* Tracks */}
          {tracks.map(track => {
            const from = stationMap.get(track.from);
            const to = stationMap.get(track.to);
            if (!from || !to) return null;
            const color = trackColor(track.status);
            return (
              <g key={track.id}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={color} strokeWidth={track.status === 'congested' ? 3 : 2}
                  strokeDasharray={track.status === 'maintenance' ? '8 4' : undefined}
                  opacity={0.6}
                />
                {/* Track label */}
                <text
                  x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                  textAnchor="middle" fill="hsl(var(--muted-foreground))"
                  fontSize={7} fontFamily="var(--font-display)" opacity={0.5}
                >
                  {track.distance}km
                </text>
              </g>
            );
          })}

          {/* Stations */}
          {stations.map(station => {
            const isTerminal = station.type === 'terminal';
            const isJunction = station.type === 'junction';
            const r = isTerminal ? 12 : isJunction ? 9 : 7;
            return (
              <g key={station.id}>
                {/* Station glow */}
                <circle cx={station.x} cy={station.y} r={r + 4}
                  fill="hsl(var(--primary))" opacity={0.06} />
                {/* Station body */}
                <circle cx={station.x} cy={station.y} r={r}
                  fill="hsl(var(--card))" stroke="hsl(var(--primary))"
                  strokeWidth={isTerminal ? 2.5 : 1.5} />
                {/* Code inside */}
                <text x={station.x} y={station.y + 3}
                  textAnchor="middle" fill="hsl(var(--primary))"
                  fontSize={isTerminal ? 7 : 6} fontFamily="var(--font-display)" fontWeight="bold"
                >
                  {station.id}
                </text>
                {/* Name below */}
                <text x={station.x} y={station.y + r + 12}
                  textAnchor="middle" fill="hsl(var(--muted-foreground))"
                  fontSize={8} fontFamily="var(--font-body)"
                >
                  {station.name}
                </text>
                {/* Zone badge */}
                <text x={station.x} y={station.y - r - 4}
                  textAnchor="middle" fill="hsl(var(--muted-foreground))"
                  fontSize={6} fontFamily="var(--font-display)" opacity={0.5}
                >
                  {station.zone}
                </text>
              </g>
            );
          })}

          {/* Trains */}
          {trainPositions.map(train => {
            const color = trainColor(train.status);
            return (
              <g key={train.id}>
                {/* Pulse */}
                <circle cx={train.x} cy={train.y} r={8} fill={color} opacity={0.15}>
                  <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.15;0.03;0.15" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Train dot */}
                <circle cx={train.x} cy={train.y} r={5} fill={color} />
                {/* Label */}
                <rect x={train.x - 16} y={train.y - 18} width={32} height={11} rx={2}
                  fill="hsl(var(--card))" stroke={color} strokeWidth={0.5} opacity={0.9} />
                <text x={train.x} y={train.y - 10}
                  textAnchor="middle" fill={color}
                  fontSize={6} fontFamily="var(--font-display)" fontWeight="bold"
                >
                  {train.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
