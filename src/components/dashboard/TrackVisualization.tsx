import { Station, TrackSection, Train } from '@/lib/railway-types';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

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
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);
  const [hoveredTrain, setHoveredTrain] = useState<string | null>(null);

  const trainPositions = useMemo(() => {
    return trains.filter(t => t.status !== 'arrived').map(train => {
      const fromId = train.route[train.currentSectionIndex];
      const toId = train.route[train.currentSectionIndex + 1];
      if (!fromId || !toId) return null;
      const from = stationMap.get(fromId);
      const to = stationMap.get(toId);
      if (!from || !to) return null;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      return {
        ...train,
        x: from.x + dx * train.progress,
        y: from.y + dy * train.progress,
        angle,
        fromId, toId,
      };
    }).filter(Boolean) as (Train & { x: number; y: number; angle: number; fromId: string; toId: string })[];
  }, [trains, stationMap]);

  const trainsAtStation = useMemo(() => {
    const m = new Map<string, number>();
    trains.forEach(t => {
      if (t.status === 'stopped' || t.progress === 0) {
        const sid = t.route[t.currentSectionIndex];
        if (sid) m.set(sid, (m.get(sid) || 0) + 1);
      }
    });
    return m;
  }, [trains]);

  return (
    <div className="glass rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground">Live Network Map</h3>
          <span className="text-[9px] font-display text-muted-foreground/60">· {trainPositions.length} en-route</span>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-display text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success" />On-Time</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning" />Delayed</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-danger" />Stopped</span>
        </div>
      </div>
      <div className="p-2 flex-1 relative">
        <svg viewBox="0 0 800 420" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.3" opacity="0.3" />
            </pattern>
            <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.04" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </radialGradient>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--primary))" opacity="0.4" />
            </marker>
          </defs>
          <rect width="800" height="420" fill="url(#grid)" />
          <rect width="800" height="420" fill="url(#bgGlow)" />

          {/* Tracks */}
          {tracks.map(track => {
            const from = stationMap.get(track.from);
            const to = stationMap.get(track.to);
            if (!from || !to) return null;
            const color = trackColor(track.status);
            const isActive = track.status !== 'clear';
            return (
              <g key={track.id}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={color} strokeWidth={track.status === 'congested' ? 3 : 2}
                  strokeDasharray={track.status === 'maintenance' ? '8 4' : undefined}
                  opacity={isActive ? 0.85 : 0.5}
                />
                {isActive && (
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={color} strokeWidth={6} opacity={0.15}
                  />
                )}
                <text
                  x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                  textAnchor="middle" fill="hsl(var(--muted-foreground))"
                  fontSize={7} fontFamily="var(--font-display)" opacity={0.5}
                >
                  {track.distance}km · {track.maxSpeed}
                </text>
              </g>
            );
          })}

          {/* Stations */}
          {stations.map(station => {
            const isTerminal = station.type === 'terminal';
            const isJunction = station.type === 'junction';
            const r = isTerminal ? 12 : isJunction ? 9 : 7;
            const isHovered = hoveredStation === station.id;
            const trainsHere = trainsAtStation.get(station.id) || 0;
            return (
              <g key={station.id}
                onMouseEnter={() => setHoveredStation(station.id)}
                onMouseLeave={() => setHoveredStation(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={station.x} cy={station.y} r={r + (isHovered ? 8 : 4)}
                  fill="hsl(var(--primary))" opacity={isHovered ? 0.15 : 0.06}
                  style={{ transition: 'all 0.2s' }}
                />
                <circle cx={station.x} cy={station.y} r={r}
                  fill="hsl(var(--card))" stroke={isHovered ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}
                  strokeWidth={isTerminal ? 2.5 : 1.5}
                  style={{ transition: 'all 0.2s' }}
                />
                <text x={station.x} y={station.y + 3}
                  textAnchor="middle" fill={isHovered ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}
                  fontSize={isTerminal ? 7 : 6} fontFamily="var(--font-display)" fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {station.id}
                </text>
                <text x={station.x} y={station.y + r + 12}
                  textAnchor="middle" fill="hsl(var(--muted-foreground))"
                  fontSize={8} fontFamily="var(--font-body)"
                  style={{ pointerEvents: 'none' }}
                >
                  {station.name}
                </text>
                <text x={station.x} y={station.y - r - 4}
                  textAnchor="middle" fill="hsl(var(--muted-foreground))"
                  fontSize={6} fontFamily="var(--font-display)" opacity={0.5}
                  style={{ pointerEvents: 'none' }}
                >
                  {station.zone}
                </text>
                {trainsHere > 0 && (
                  <g style={{ pointerEvents: 'none' }}>
                    <circle cx={station.x + r} cy={station.y - r} r={5} fill="hsl(var(--accent))" />
                    <text x={station.x + r} y={station.y - r + 2}
                      textAnchor="middle" fill="hsl(var(--accent-foreground))"
                      fontSize={6} fontFamily="var(--font-display)" fontWeight="bold"
                    >
                      {trainsHere}
                    </text>
                  </g>
                )}
                {/* Tooltip */}
                {isHovered && (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect x={station.x + 14} y={station.y - 22} width={120} height={42} rx={4}
                      fill="hsl(var(--popover))" stroke="hsl(var(--accent))" strokeWidth={0.5} opacity={0.97}
                    />
                    <text x={station.x + 20} y={station.y - 10}
                      fill="hsl(var(--foreground))" fontSize={9} fontFamily="var(--font-display)" fontWeight="bold"
                    >
                      {station.name}
                    </text>
                    <text x={station.x + 20} y={station.y + 1}
                      fill="hsl(var(--muted-foreground))" fontSize={7} fontFamily="var(--font-display)"
                    >
                      {station.type.toUpperCase()} · {station.platforms} platforms
                    </text>
                    <text x={station.x + 20} y={station.y + 12}
                      fill="hsl(var(--muted-foreground))" fontSize={7} fontFamily="var(--font-display)"
                    >
                      Zone: {station.zone}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Trains */}
          {trainPositions.map(train => {
            const color = trainColor(train.status);
            const isHovered = hoveredTrain === train.id;
            return (
              <g key={train.id}
                onMouseEnter={() => setHoveredTrain(train.id)}
                onMouseLeave={() => setHoveredTrain(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={train.x} cy={train.y} r={8} fill={color} opacity={0.15}>
                  <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.15;0.03;0.15" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={train.x} cy={train.y} r={isHovered ? 7 : 5} fill={color}
                  style={{ transition: 'all 0.15s' }}
                />
                {/* Direction triangle */}
                {train.status !== 'stopped' && (
                  <polygon
                    points="0,-2 4,0 0,2"
                    fill="hsl(var(--background))"
                    transform={`translate(${train.x} ${train.y}) rotate(${train.angle})`}
                  />
                )}
                <rect x={train.x - 18} y={train.y - 20} width={36} height={11} rx={2}
                  fill="hsl(var(--card))" stroke={color} strokeWidth={0.5} opacity={0.95} />
                <text x={train.x} y={train.y - 12}
                  textAnchor="middle" fill={color}
                  fontSize={6.5} fontFamily="var(--font-display)" fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {train.id}
                </text>
                {isHovered && (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect x={train.x + 10} y={train.y + 8} width={140} height={48} rx={4}
                      fill="hsl(var(--popover))" stroke={color} strokeWidth={0.5} opacity={0.97}
                    />
                    <text x={train.x + 16} y={train.y + 20}
                      fill="hsl(var(--foreground))" fontSize={9} fontFamily="var(--font-display)" fontWeight="bold"
                    >
                      {train.name}
                    </text>
                    <text x={train.x + 16} y={train.y + 31}
                      fill="hsl(var(--muted-foreground))" fontSize={7} fontFamily="var(--font-display)"
                    >
                      {train.fromId} → {train.toId} · {train.speed} km/h
                    </text>
                    <text x={train.x + 16} y={train.y + 42}
                      fill={train.delay > 2 ? 'hsl(var(--warning))' : 'hsl(var(--success))'}
                      fontSize={7} fontFamily="var(--font-display)"
                    >
                      Delay: +{train.delay.toFixed(1)}m · ETA: +{train.predictedDelay.toFixed(1)}m
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
