import { Train, Alert, AIRecommendation, PerformanceMetrics, TrackSection, Station, SimulationState, WhatIfScenario } from './railway-types';
import { stations, tracks, initialTrains } from './railway-data';

// ─── A* Pathfinding ────────────────────────────────────────────────
function heuristic(a: Station, b: Station): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function getNeighbors(stationId: string, trackList: TrackSection[]): { stationId: string; track: TrackSection }[] {
  const neighbors: { stationId: string; track: TrackSection }[] = [];
  for (const t of trackList) {
    if (t.status === 'maintenance') continue;
    const congestionPenalty = t.status === 'congested' ? 2 : 1;
    if (t.from === stationId) neighbors.push({ stationId: t.to, track: { ...t, distance: t.distance * congestionPenalty } });
    if (t.to === stationId) neighbors.push({ stationId: t.from, track: { ...t, distance: t.distance * congestionPenalty } });
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
      while (cameFrom.has(current)) { current = cameFrom.get(current)!; path.unshift(current); }
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

// ─── Delay Prediction (LSTM-inspired weighted moving average) ──────
const delayBuffer = new Map<string, number[]>();

function predictDelay(train: Train, tick: number): number {
  const buf = delayBuffer.get(train.id) || [];
  buf.push(train.delay);
  if (buf.length > 20) buf.shift();
  delayBuffer.set(train.id, buf);

  // Exponentially weighted moving average (simulates LSTM memory)
  let alpha = 0.3;
  let ewma = buf[0];
  for (let i = 1; i < buf.length; i++) {
    ewma = alpha * buf[i] + (1 - alpha) * ewma;
  }

  // Contextual factors
  let factor = 1.0;
  if (train.type === 'freight') factor += 0.3;
  if (train.type === 'local') factor += 0.15;
  if (tick % 100 < 20) factor += 0.2; // peak hours
  if (train.currentSectionIndex > train.route.length * 0.6) factor *= 0.85; // recovery near end

  return Math.max(0, Math.round(ewma * factor * 10) / 10);
}

// ─── Congestion Forecasting ────────────────────────────────────────
function computeCongestion(trains: Train[], trackList: TrackSection[]): Map<string, number> {
  const sectionLoad = new Map<string, number>();
  for (const t of trains) {
    if (t.status === 'arrived') continue;
    const fromId = t.route[t.currentSectionIndex];
    const toId = t.route[t.currentSectionIndex + 1];
    if (!fromId || !toId) continue;
    const key = [fromId, toId].sort().join('-');
    sectionLoad.set(key, (sectionLoad.get(key) || 0) + 1);
  }
  return sectionLoad;
}

// ─── Conflict Detection ────────────────────────────────────────────
function detectConflicts(trains: Train[]): { trainA: string; trainB: string; section: string; risk: number }[] {
  const conflicts: { trainA: string; trainB: string; section: string; risk: number }[] = [];
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
        if (proximity < 0.2) {
          conflicts.push({
            trainA: a.id, trainB: b.id,
            section: `${sA}-${sA2}`,
            risk: Math.round((1 - proximity / 0.2) * 100),
          });
        }
      }
    }
  }
  return conflicts;
}

// ─── AI Recommendation Engine ──────────────────────────────────────
function generateRecommendations(
  trains: Train[],
  conflicts: { trainA: string; trainB: string; risk: number }[],
  congestion: Map<string, number>,
  tick: number
): AIRecommendation[] {
  const recs: AIRecommendation[] = [];

  for (const train of trains) {
    if (train.delay > 8 && train.status !== 'arrived') {
      const savings = Math.round(train.delay * 0.4 + Math.random() * 3);
      recs.push({
        id: `rec-reroute-${train.id}-${tick}`,
        type: 'reroute',
        title: `Reroute ${train.name}`,
        description: `AI suggests alternate route via bypass to recover ${savings} min delay. Current delay: ${train.delay.toFixed(1)} min.`,
        impact: `Save ~${savings} min, improve punctuality`,
        confidence: 0.72 + Math.random() * 0.2,
        trainId: train.id,
        timestamp: tick,
        savings,
      });
    }

    if (train.speed < train.maxSpeed * 0.4 && train.speed > 0 && train.status !== 'arrived') {
      const targetSpeed = Math.round(train.maxSpeed * 0.85);
      recs.push({
        id: `rec-speed-${train.id}-${tick}`,
        type: 'speed-adjust',
        title: `Accelerate ${train.id}`,
        description: `Increase speed from ${train.speed} to ${targetSpeed} km/h. Section ahead is clear.`,
        impact: 'Reduce ETA by ~3 min',
        confidence: 0.88,
        trainId: train.id,
        timestamp: tick,
        savings: 3,
      });
    }
  }

  for (const c of conflicts) {
    const trainA = trains.find(t => t.id === c.trainA);
    const trainB = trains.find(t => t.id === c.trainB);
    if (!trainA || !trainB) continue;
    const hold = trainA.priority > trainB.priority ? trainA : trainB;
    const pass = trainA.priority > trainB.priority ? trainB : trainA;
    recs.push({
      id: `rec-conflict-${c.trainA}-${tick}`,
      type: 'priority-override',
      title: `Resolve Conflict: ${c.trainA}/${c.trainB}`,
      description: `Hold ${hold.name} (P${hold.priority}) at signal, let ${pass.name} (P${pass.priority}) pass first. Risk: ${c.risk}%`,
      impact: `Prevent collision, +2 min to ${hold.id}`,
      confidence: 0.96,
      trainId: c.trainA,
      timestamp: tick,
      savings: 0,
    });
  }

  for (const [section, load] of congestion) {
    if (load >= 3) {
      recs.push({
        id: `rec-cong-${section}-${tick}`,
        type: 'hold',
        title: `Decongest ${section}`,
        description: `${load} trains on section ${section}. Recommend holding incoming trains at previous station.`,
        impact: 'Reduce congestion, improve flow',
        confidence: 0.82,
        timestamp: tick,
        savings: 5,
      });
    }
  }

  return recs.slice(0, 6);
}

// ─── Metrics ───────────────────────────────────────────────────────
function computeMetrics(trains: Train[], conflictsResolved: number, congestion: Map<string, number>): PerformanceMetrics {
  const active = trains.filter(t => t.status !== 'arrived');
  const delayed = trains.filter(t => t.delay > 2);
  const onTime = trains.filter(t => t.delay <= 2);
  const avgDelay = trains.reduce((s, t) => s + t.delay, 0) / Math.max(trains.length, 1);
  const avgSpeed = active.length > 0 ? active.reduce((s, t) => s + t.speed, 0) / active.length : 0;
  const totalPassengers = trains.reduce((s, t) => s + t.passengers, 0);
  const maxCongestion = Math.max(0, ...Array.from(congestion.values()));
  const congestionIndex = Math.min(100, maxCongestion * 25);

  return {
    onTimePercentage: trains.length > 0 ? Math.round((onTime.length / trains.length) * 100) : 100,
    averageDelay: Math.round(avgDelay * 10) / 10,
    activeTrains: active.length,
    delayedTrains: delayed.length,
    totalTrains: trains.length,
    efficiency: Math.max(0, Math.round(100 - avgDelay * 3 - congestionIndex * 0.2)),
    throughput: active.filter(t => t.speed > 0).length,
    conflictsResolved,
    totalPassengers,
    avgSpeed: Math.round(avgSpeed),
    congestionIndex: Math.round(congestionIndex),
    safetyScore: Math.max(70, Math.round(100 - conflictsResolved * 0.5)),
  };
}

// ─── Simulation ────────────────────────────────────────────────────
export function createInitialState(): SimulationState {
  const congestion = computeCongestion(initialTrains, tracks);
  return {
    trains: JSON.parse(JSON.stringify(initialTrains)),
    alerts: [
      { id: 'a0', type: 'signal', severity: 'info', title: 'System Online', message: 'AI Railway Controller initialized. All systems nominal.', timestamp: 0, resolved: false, autoResolveAt: 20 },
      { id: 'a1', type: 'delay', severity: 'warning', title: 'Vande Bharat Delayed', message: '22691 Vande Bharat held at New Delhi due to late platform clearance. Delay: 5 min.', trainId: '22691', timestamp: 0, resolved: false },
      { id: 'a2', type: 'delay', severity: 'warning', title: 'Brahmaputra Running Late', message: '14055 running 12 min behind schedule at Kanpur section.', trainId: '14055', timestamp: 0, resolved: false },
    ],
    recommendations: [],
    metrics: computeMetrics(initialTrains, 0, congestion),
    stations,
    tracks: JSON.parse(JSON.stringify(tracks)),
    tick: 0,
    speed: 1,
    running: true,
    timeOfDay: '06:00',
    delayHistory: [],
    throughputHistory: [],
  };
}

function formatTime(tick: number): string {
  const baseHour = 6;
  const minutes = tick * 2; // each tick = 2 min
  const h = (baseHour + Math.floor(minutes / 60)) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function simulateTick(state: SimulationState): SimulationState {
  const newTick = state.tick + 1;
  const timeOfDay = formatTime(newTick);

  // Update trains
  const newTrains = state.trains.map(train => {
    if (train.status === 'arrived') return train;
    const t = { ...train };

    if (t.status === 'stopped') {
      if (newTick - t.lastStationTime > 15 || (newTick % 12 === 0)) {
        t.status = 'delayed';
        t.speed = t.maxSpeed * 0.4;
        t.lastStationTime = newTick;
      }
      t.delay += 0.15;
      t.predictedDelay = predictDelay(t, newTick);
      return t;
    }

    // Movement
    const speedNoise = (Math.random() - 0.5) * 0.004;
    const speedFactor = (t.speed / 160) * 0.018 * state.speed;
    t.progress += speedFactor + speedNoise;

    // Random events
    if (Math.random() < 0.004) { t.delay += Math.random() * 3; t.speed = Math.max(15, t.speed - 25); }
    if (Math.random() < 0.006) { t.speed = Math.min(t.maxSpeed, t.speed + 15); }
    if (Math.random() < 0.001 && t.type !== 'superfast') { t.status = 'stopped'; t.speed = 0; t.lastStationTime = newTick; return t; }

    // Section advancement
    if (t.progress >= 1) {
      t.currentSectionIndex++;
      t.progress = 0;
      t.lastStationTime = newTick;
      if (t.currentSectionIndex >= t.route.length - 1) {
        t.status = 'arrived'; t.speed = 0; t.progress = 1; return t;
      }
      // Brief station stop for non-superfast
      if (t.type !== 'superfast' && Math.random() < 0.5) {
        t.speed = Math.max(t.speed * 0.3, 20);
      }
    }

    t.actualDeparture = newTick;
    t.predictedDelay = predictDelay(t, newTick);
    t.status = t.delay > 2 ? 'delayed' : 'on-time';
    t.fuelEfficiency = Math.max(60, Math.round(100 - t.delay * 1.5 - (t.maxSpeed - t.speed) * 0.1));
    return t;
  });

  // Respawn arrived trains
  const respawned = newTrains.map(t => {
    if (t.status === 'arrived' && Math.random() < 0.015) {
      const orig = initialTrains.find(o => o.id === t.id)!;
      return { ...JSON.parse(JSON.stringify(orig)), delay: Math.random() * 3, predictedDelay: 0, lastStationTime: newTick };
    }
    return t;
  });

  // Conflict detection and resolution
  const conflicts = detectConflicts(respawned);
  const conflictsResolved = state.metrics.conflictsResolved + conflicts.length;

  for (const c of conflicts) {
    const a = respawned.find(t => t.id === c.trainA)!;
    const b = respawned.find(t => t.id === c.trainB)!;
    if (a.priority < b.priority) { b.speed = Math.max(10, b.speed - 35); b.delay += 0.8; }
    else { a.speed = Math.max(10, a.speed - 35); a.delay += 0.8; }
  }

  // Congestion
  const congestion = computeCongestion(respawned, state.tracks);

  // Track status updates
  const newTracks = state.tracks.map(track => {
    const key = [track.from, track.to].sort().join('-');
    const load = congestion.get(key) || 0;
    return { ...track, status: (load >= 3 ? 'congested' : load >= 2 ? 'occupied' : track.status === 'maintenance' ? 'maintenance' : 'clear') as TrackSection['status'] };
  });

  // Alerts
  let newAlerts = [...state.alerts.filter(a => !a.resolved && (!a.autoResolveAt || a.autoResolveAt > newTick))];

  for (const c of conflicts) {
    newAlerts.push({
      id: `alert-c-${newTick}-${c.trainA}`, type: 'conflict', severity: 'critical',
      title: 'Track Conflict Detected',
      message: `${c.trainA} and ${c.trainB} on ${c.section}. Risk: ${c.risk}%. Auto-resolving by priority.`,
      trainId: c.trainA, sectionId: c.section, timestamp: newTick, resolved: false, autoResolveAt: newTick + 15,
    });
  }

  for (const t of respawned) {
    if (t.delay > 10 && newTick % 25 === 0 && t.status !== 'arrived') {
      newAlerts.push({
        id: `alert-d-${newTick}-${t.id}`, type: 'delay', severity: 'warning',
        title: `${t.name} Severely Delayed`,
        message: `Running ${t.delay.toFixed(0)} min behind schedule. Predicted: +${t.predictedDelay.toFixed(0)} min at destination.`,
        trainId: t.id, timestamp: newTick, resolved: false, autoResolveAt: newTick + 40,
      });
    }
  }

  if (newTick % 80 === 0 && Math.random() < 0.4) {
    const randomTrack = newTracks[Math.floor(Math.random() * newTracks.length)];
    newAlerts.push({
      id: `alert-m-${newTick}`, type: 'maintenance', severity: 'info',
      title: 'Maintenance Advisory',
      message: `Scheduled inspection on ${randomTrack.id} (${randomTrack.from}→${randomTrack.to}). Speed restriction may apply.`,
      sectionId: randomTrack.id, timestamp: newTick, resolved: false, autoResolveAt: newTick + 50,
    });
  }

  newAlerts = newAlerts.slice(-25);

  // AI recommendations
  const recs = newTick % 8 === 0 ? generateRecommendations(respawned, conflicts, congestion, newTick) : state.recommendations;

  // History
  const metrics = computeMetrics(respawned, conflictsResolved, congestion);
  const delayHistory = [...state.delayHistory, metrics.averageDelay].slice(-60);
  const throughputHistory = [...state.throughputHistory, metrics.throughput].slice(-60);

  return {
    ...state,
    trains: respawned,
    alerts: newAlerts,
    recommendations: recs,
    metrics,
    tracks: newTracks,
    tick: newTick,
    timeOfDay,
    delayHistory,
    throughputHistory,
  };
}

export function applyScenario(state: SimulationState, scenario: WhatIfScenario): SimulationState {
  const newState = { ...state };
  
  switch (scenario.type) {
    case 'delay': {
      const trainId = scenario.params.trainId as string;
      const delayMin = scenario.params.delayMin as number;
      newState.trains = state.trains.map(t =>
        t.id === trainId ? { ...t, delay: t.delay + delayMin, status: 'stopped' as const, speed: 0, lastStationTime: state.tick } : t
      );
      newState.alerts = [...state.alerts, {
        id: `scenario-${scenario.id}-${state.tick}`, type: 'emergency', severity: 'critical',
        title: `⚡ ${scenario.name}`, message: scenario.description,
        trainId, timestamp: state.tick, resolved: false, autoResolveAt: state.tick + 40,
      }];
      break;
    }
    case 'weather': {
      const trackId = scenario.params.trackId as string;
      const reduction = scenario.params.speedReduction as number;
      newState.tracks = state.tracks.map(t =>
        t.id === trackId ? { ...t, maxSpeed: Math.max(30, t.maxSpeed - reduction), status: 'congested' as const } : t
      );
      newState.alerts = [...state.alerts, {
        id: `scenario-${scenario.id}-${state.tick}`, type: 'weather', severity: 'critical',
        title: `🌫️ ${scenario.name}`, message: scenario.description,
        sectionId: trackId, timestamp: state.tick, resolved: false, autoResolveAt: state.tick + 60,
      }];
      break;
    }
    case 'congestion': {
      const trackId = scenario.params.trackId as string;
      newState.tracks = state.tracks.map(t =>
        t.id === trackId ? { ...t, status: 'congested' as const, maxSpeed: Math.round(t.maxSpeed * 0.5) } : t
      );
      break;
    }
    case 'breakdown': {
      const stationId = scenario.params.stationId as string;
      newState.trains = state.trains.map(t => {
        if (t.route[t.currentSectionIndex] === stationId || t.route[t.currentSectionIndex + 1] === stationId) {
          return { ...t, speed: Math.max(10, t.speed * 0.3), delay: t.delay + 10 };
        }
        return t;
      });
      newState.alerts = [...state.alerts, {
        id: `scenario-${scenario.id}-${state.tick}`, type: 'signal', severity: 'critical',
        title: `🚨 ${scenario.name}`, message: scenario.description,
        timestamp: state.tick, resolved: false, autoResolveAt: state.tick + 50,
      }];
      break;
    }
  }
  return newState;
}
