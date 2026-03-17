import { Station, TrackSection, Train } from '@/lib/railway-types';
import { useMemo } from 'react';

interface TrackVisualizationProps {
  stations: Station[];
  tracks: TrackSection[];
  trains: Train[];
}

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
      const x = from.x + (to.x - from.x) * train.progress;
      const y = from.y + (to.y - from.y) * train.progress;
      return { ...train, x, y };
    }).filter(Boolean) as (Train & { x: number; y: number })[];
  }, [trains, stationMap]);

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Live Track Map</h3>
      </div>
      <div className="p-2">
        <svg viewBox="0 0 620 400" className="w-full h-auto" style={{ minHeight: 250 }}>
          {/* Track lines */}
          {tracks.map(track => {
            const from = stationMap.get(track.from);
            const to = stationMap.get(track.to);
            if (!from || !to) return null;
            const color = track.status === 'maintenance' ? 'hsl(var(--warning))' : 'hsl(var(--border))';
            return (
              <line
                key={track.id}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={color}
                strokeWidth={track.status === 'maintenance' ? 3 : 2}
                strokeDasharray={track.status === 'maintenance' ? '6 3' : undefined}
              />
            );
          })}
          
          {/* Stations */}
          {stations.map(station => (
            <g key={station.id}>
              <circle cx={station.x} cy={station.y} r={10} fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth={2} />
              <text
                x={station.x} y={station.y + 24}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize={10}
                fontFamily="var(--font-display)"
              >
                {station.name}
              </text>
            </g>
          ))}

          {/* Trains */}
          {trainPositions.map(train => {
            const color = train.status === 'delayed' ? 'hsl(var(--warning))'
              : train.status === 'stopped' ? 'hsl(var(--danger))'
              : 'hsl(var(--primary))';
            return (
              <g key={train.id}>
                <circle cx={train.x} cy={train.y} r={7} fill={color} opacity={0.3}>
                  <animate attributeName="r" values="7;12;7" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={train.x} cy={train.y} r={5} fill={color} />
                <text
                  x={train.x} y={train.y - 12}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  fontSize={8}
                  fontFamily="var(--font-display)"
                  fontWeight="bold"
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
