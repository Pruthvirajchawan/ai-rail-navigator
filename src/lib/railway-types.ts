export interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
  zone: string;
  platforms: number;
  type: 'junction' | 'terminal' | 'halt' | 'major';
}

export interface TrackSection {
  id: string;
  from: string;
  to: string;
  distance: number;
  maxSpeed: number;
  status: 'clear' | 'occupied' | 'maintenance' | 'congested';
  gradient: number; // % incline
  electrified: boolean;
}

export interface Train {
  id: string;
  name: string;
  type: 'superfast' | 'express' | 'local' | 'freight';
  priority: number; // 1=highest
  route: string[];
  currentSectionIndex: number;
  progress: number;
  speed: number;
  maxSpeed: number;
  status: 'on-time' | 'delayed' | 'stopped' | 'arrived' | 'departed';
  scheduledDeparture: number;
  actualDeparture: number;
  delay: number;
  predictedDelay: number;
  passengers: number;
  direction: 'up' | 'down';
  fuelEfficiency: number;
  lastStationTime: number;
}

export interface Alert {
  id: string;
  type: 'delay' | 'conflict' | 'maintenance' | 'congestion' | 'emergency' | 'weather' | 'signal';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  trainId?: string;
  sectionId?: string;
  timestamp: number;
  resolved: boolean;
  autoResolveAt?: number;
}

export interface AIRecommendation {
  id: string;
  type: 'reroute' | 'speed-adjust' | 'schedule-change' | 'priority-override' | 'hold' | 'platform-change';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  trainId?: string;
  timestamp: number;
  savings: number; // minutes saved
}

export interface PerformanceMetrics {
  onTimePercentage: number;
  averageDelay: number;
  activeTrains: number;
  delayedTrains: number;
  totalTrains: number;
  efficiency: number;
  throughput: number;
  conflictsResolved: number;
  totalPassengers: number;
  avgSpeed: number;
  congestionIndex: number;
  safetyScore: number;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  description: string;
  type: 'delay' | 'breakdown' | 'weather' | 'congestion' | 'reroute';
  params: Record<string, unknown>;
}

export interface SimulationState {
  trains: Train[];
  alerts: Alert[];
  recommendations: AIRecommendation[];
  metrics: PerformanceMetrics;
  stations: Station[];
  tracks: TrackSection[];
  tick: number;
  speed: number;
  running: boolean;
  timeOfDay: string;
  delayHistory: number[];
  throughputHistory: number[];
}
