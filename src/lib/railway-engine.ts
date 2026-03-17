import { Train, Alert, AIRecommendation, PerformanceMetrics, TrackSection, Station, SimulationState } from './railway-types';
import { stations, tracks, initialTrains } from './railway-data';

// A* pathfinding
function heuristic(a: Station, b: Station): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function getNeighbors(stationId: string, trackList: TrackSection[]): { stationId: string; track: TrackSection }[] {
  const neighbors: { stationId: string; track: TrackSection }[] = [];
  for (const t of trackList) {
    if (t.status === 'maintenance') continue;
    if (t.from === stationId) neighbors.push({ stationId: t.to, track: t });
    if (t.to === stationId) neighbors.push({ stationId: t.from, track: t });
  }
  return neighbors;
}

export function aStarRoute(start: string, end: string, stationList: Station[], trackList: TrackSection[]): string[] {
  const stationMap = new Map(stationList.map(s => [s.id, s]));
  const openSet = new Set([start]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  gScore.set(start, 0);
  fScore.set(start, heuristic(stationMap.get(start)!, stationMap.get(end)!));

  while (openSet.size > 0) {
    let current = '';
    let lowestF = Infinity;
    for (const node of openSet) {
      const f = fScore.get(node) ?? Infinity;
      if (f < lowestF) { lowestF = f; current = node; }
    }

    if (current === end) {
      const path: string[] = [current];
      while (cameFrom.has(current)) {
        current = cameFrom.get(current)!;
        path.unshift(current);
      }
      return path;
    }

    openSet.delete(current);
    for (const { stationId: neighbor, track } of getNeighbors(current, trackList)) {
      const tentativeG = (gScore.get(current) ?? Infinity) + track.distance / track.maxSpeed;
      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(stationMap.get(neighbor)!, stationMap.get(end)!));
        openSet.add(neighbor);
      }
    }
  }
  return [];
}

// Track conflict detection
function detectConflicts(trains: Train[]): { trainA: string; trainB: string; section: string }[] {
  const conflicts: { trainA: string; trainB: string; section: string }[] = [];
  for (let i = 0; i < trains.length; i++) {
    for (let j = i + 1; j < trains.length; j++) {
      const a = trains[i], b = trains[j];
      if (a.status === 'arrived' || b.status === 'arrived') continue;
      const sectionA = a.route[a.currentSectionIndex] + '-' + a.route[a.currentSectionIndex + 1];
      const sectionB = b.route[b.currentSectionIndex] + '-' + b.route[b.currentSectionIndex + 1];
      if (sectionA === sectionB && Math.abs(a.progress - b.progress) < 0.15) {
        conflicts.push({ trainA: a.id, trainB: b.id, section: sectionA });
      }
    }
  }
  return conflicts;
}

// Delay prediction (rule-based with noise)
function predictDelay(train: Train, tick: number): number {
  let prediction = train.delay;
  if (train.type === 'freight') prediction += 0.5;
  if (train.currentSectionIndex > train.route.length / 2) prediction *= 0.8;
  if (tick % 50 < 10) prediction += Math.random() * 2; // congestion window
  return Math.max(0, Math.round(prediction * 10) / 10);
}

// Generate AI recommendations
function generateRecommendations(trains: Train[], conflicts: { trainA: string; trainB: string }[], tick: number): AIRecommendation[] {
  const recs: AIRecommendation[] = [];
  
  for (const train of trains) {
    if (train.delay > 3) {
      recs.push({
        id: `rec-${train.id}-${tick}`,
        type: 'reroute',
        description: `Reroute ${train.name} via alternate path to reduce ${train.delay.toFixed(1)} min delay`,
        impact: `Save ~${(train.delay * 0.6).toFixed(1)} minutes`,
        confidence: 0.78 + Math.random() * 0.15,
        trainId: train.id,
        timestamp: tick,
      });
    }
    if (train.speed < train.maxSpeed * 0.5 && train.status !== 'stopped' && train.status !== 'arrived') {
      recs.push({
        id: `rec-speed-${train.id}-${tick}`,
        type: 'speed-adjust',
        description: `Increase ${train.name} speed to ${Math.round(train.maxSpeed * 0.8)} km/h`,
        impact: 'Reduce delay by ~1.5 min',
        confidence: 0.85,
        trainId: train.id,
        timestamp: tick,
      });
    }
  }

  for (const c of conflicts) {
    recs.push({
      id: `rec-conflict-${c.trainA}-${tick}`,
      type: 'priority-override',
      description: `Resolve conflict: Hold ${c.trainB} for ${c.trainA} priority pass`,
      impact: 'Prevent collision, ~2 min delay to lower priority train',
      confidence: 0.95,
      trainId: c.trainA,
      timestamp: tick,
    });
  }

  return recs.slice(0, 5);
}

// Compute metrics
function computeMetrics(trains: Train[], conflictsResolved: number): PerformanceMetrics {
  const active = trains.filter(t => t.status !== 'arrived');
  const delayed = trains.filter(t => t.status === 'delayed');
  const onTime = trains.filter(t => t.status === 'on-time');
  const avgDelay = trains.reduce((s, t) => s + t.delay, 0) / trains.length;
  
  return {
    onTimePercentage: trains.length > 0 ? (onTime.length / trains.length) * 100 : 100,
    averageDelay: Math.round(avgDelay * 10) / 10,
    activeTrains: active.length,
    delayedTrains: delayed.length,
    totalTrains: trains.length,
    efficiency: Math.max(0, 100 - avgDelay * 5),
    throughput: active.filter(t => t.speed > 0).length,
    conflictsResolved,
  };
}

export function createInitialState(): SimulationState {
  return {
    trains: JSON.parse(JSON.stringify(initialTrains)),
    alerts: [
      { id: 'a1', type: 'maintenance', severity: 'info', message: 'Track T6 scheduled maintenance at 14:00', timestamp: 0, resolved: false },
      { id: 'a2', type: 'delay', severity: 'warning', message: 'TR005 Vande Bharat delayed at Central station', trainId: 'TR005', timestamp: 0, resolved: false },
    ],
    recommendations: [],
    metrics: computeMetrics(initialTrains, 0),
    stations,
    tracks: JSON.parse(JSON.stringify(tracks)),
    tick: 0,
    speed: 1,
    running: true,
  };
}

export function simulateTick(state: SimulationState): SimulationState {
  const newTick = state.tick + 1;
  const newTrains = state.trains.map(train => {
    if (train.status === 'arrived') return train;

    const t = { ...train };
    const route = t.route;
    
    // Stopped train may resume
    if (t.status === 'stopped') {
      if (newTick % 20 === 0) {
        t.status = 'delayed';
        t.speed = t.maxSpeed * 0.5;
      }
      t.delay += 0.1;
      t.predictedDelay = predictDelay(t, newTick);
      return t;
    }

    // Move train forward
    const speedFactor = (t.speed / 150) * 0.02 * state.speed;
    t.progress += speedFactor + (Math.random() - 0.5) * 0.003;

    // Random events
    if (Math.random() < 0.003) {
      t.delay += Math.random() * 2;
      t.speed = Math.max(20, t.speed - 20);
    }
    if (Math.random() < 0.005) {
      t.speed = Math.min(t.maxSpeed, t.speed + 10);
    }

    // Section advancement
    if (t.progress >= 1) {
      t.currentSectionIndex++;
      t.progress = 0;
      if (t.currentSectionIndex >= route.length - 1) {
        t.status = 'arrived';
        t.speed = 0;
        t.progress = 1;
        return t;
      }
    }

    // Update status
    t.actualTime = newTick;
    t.predictedDelay = predictDelay(t, newTick);
    if (t.delay > 1) t.status = 'delayed';
    else t.status = 'on-time';

    return t;
  });

  // Re-spawn arrived trains after some ticks
  const respawned = newTrains.map(t => {
    if (t.status === 'arrived' && Math.random() < 0.02) {
      const original = initialTrains.find(o => o.id === t.id)!;
      return { ...JSON.parse(JSON.stringify(original)), delay: 0, predictedDelay: 0 };
    }
    return t;
  });

  // Detect conflicts
  const conflicts = detectConflicts(respawned);
  const conflictsResolved = state.metrics.conflictsResolved + conflicts.length;

  // Handle conflicts - slow down lower priority train
  for (const c of conflicts) {
    const a = respawned.find(t => t.id === c.trainA)!;
    const b = respawned.find(t => t.id === c.trainB)!;
    if (a.priority < b.priority) {
      b.speed = Math.max(10, b.speed - 30);
      b.delay += 0.5;
    } else {
      a.speed = Math.max(10, a.speed - 30);
      a.delay += 0.5;
    }
  }

  // Generate alerts
  const newAlerts = [...state.alerts.filter(a => !a.resolved)];
  
  for (const c of conflicts) {
    newAlerts.push({
      id: `alert-conflict-${newTick}-${c.trainA}`,
      type: 'conflict',
      severity: 'critical',
      message: `Conflict detected: ${c.trainA} and ${c.trainB} on section ${c.section}`,
      trainId: c.trainA,
      timestamp: newTick,
      resolved: false,
    });
  }

  for (const t of respawned) {
    if (t.delay > 5 && Math.random() < 0.1) {
      newAlerts.push({
        id: `alert-delay-${newTick}-${t.id}`,
        type: 'delay',
        severity: 'warning',
        message: `${t.name} delay exceeds ${t.delay.toFixed(1)} min`,
        trainId: t.id,
        timestamp: newTick,
        resolved: false,
      });
    }
  }

  // Auto-resolve old alerts
  const resolvedAlerts = newAlerts.map(a => {
    if (newTick - a.timestamp > 60) return { ...a, resolved: true };
    return a;
  }).slice(-20);

  const recs = newTick % 10 === 0 ? generateRecommendations(respawned, conflicts, newTick) : state.recommendations;

  return {
    ...state,
    trains: respawned,
    alerts: resolvedAlerts,
    recommendations: recs,
    metrics: computeMetrics(respawned, conflictsResolved),
    tick: newTick,
  };
}
