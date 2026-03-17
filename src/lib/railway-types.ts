export interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface TrackSection {
  id: string;
  from: string;
  to: string;
  distance: number;
  maxSpeed: number;
  status: 'clear' | 'occupied' | 'maintenance';
}

export interface Train {
  id: string;
  name: string;
  type: 'express' | 'local' | 'freight';
  priority: number;
  route: string[];
  currentSectionIndex: number;
  progress: number; // 0-1 within current section
  speed: number;
  maxSpeed: number;
  status: 'on-time' | 'delayed' | 'stopped' | 'arrived';
  scheduledTime: number;
  actualTime: number;
  delay: number;
  predictedDelay: number;
  passengers: number;
}

export interface Alert {
  id: string;
  type: 'delay' | 'conflict' | 'maintenance' | 'congestion' | 'reroute';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  trainId?: string;
  timestamp: number;
  resolved: boolean;
}

export interface AIRecommendation {
  id: string;
  type: 'reroute' | 'speed-adjust' | 'schedule-change' | 'priority-override';
  description: string;
  impact: string;
  confidence: number;
  trainId?: string;
  timestamp: number;
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
}
