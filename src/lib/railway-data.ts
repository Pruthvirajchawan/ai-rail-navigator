import { Station, TrackSection, Train, WhatIfScenario } from './railway-types';

export const stations: Station[] = [
  { id: 'NDLS', name: 'New Delhi', x: 80, y: 180, zone: 'NR', platforms: 16, type: 'terminal' },
  { id: 'GZB', name: 'Ghaziabad', x: 190, y: 100, zone: 'NR', platforms: 6, type: 'junction' },
  { id: 'CNB', name: 'Kanpur', x: 340, y: 80, zone: 'NCR', platforms: 10, type: 'major' },
  { id: 'ALD', name: 'Prayagraj', x: 480, y: 110, zone: 'NCR', platforms: 10, type: 'junction' },
  { id: 'MGS', name: 'Mughal Sarai', x: 580, y: 150, zone: 'ECR', platforms: 8, type: 'junction' },
  { id: 'AGC', name: 'Agra', x: 200, y: 270, zone: 'NCR', platforms: 6, type: 'major' },
  { id: 'JHS', name: 'Jhansi', x: 310, y: 300, zone: 'NCR', platforms: 7, type: 'junction' },
  { id: 'BPL', name: 'Bhopal', x: 380, y: 340, zone: 'WCR', platforms: 6, type: 'major' },
  { id: 'NGP', name: 'Nagpur', x: 500, y: 310, zone: 'CR', platforms: 8, type: 'junction' },
  { id: 'LKO', name: 'Lucknow', x: 350, y: 170, zone: 'NR', platforms: 9, type: 'major' },
  { id: 'PNBE', name: 'Patna', x: 620, y: 90, zone: 'ECR', platforms: 10, type: 'major' },
  { id: 'HWH', name: 'Howrah', x: 720, y: 170, zone: 'ER', platforms: 23, type: 'terminal' },
];

export const tracks: TrackSection[] = [
  { id: 'T01', from: 'NDLS', to: 'GZB', distance: 32, maxSpeed: 130, status: 'clear', gradient: 0, electrified: true },
  { id: 'T02', from: 'GZB', to: 'CNB', distance: 440, maxSpeed: 130, status: 'clear', gradient: 0.2, electrified: true },
  { id: 'T03', from: 'CNB', to: 'ALD', distance: 200, maxSpeed: 120, status: 'clear', gradient: 0.1, electrified: true },
  { id: 'T04', from: 'ALD', to: 'MGS', distance: 150, maxSpeed: 110, status: 'clear', gradient: 0, electrified: true },
  { id: 'T05', from: 'MGS', to: 'PNBE', distance: 230, maxSpeed: 120, status: 'clear', gradient: 0.3, electrified: true },
  { id: 'T06', from: 'PNBE', to: 'HWH', distance: 530, maxSpeed: 130, status: 'clear', gradient: 0, electrified: true },
  { id: 'T07', from: 'NDLS', to: 'AGC', distance: 195, maxSpeed: 140, status: 'clear', gradient: 0, electrified: true },
  { id: 'T08', from: 'AGC', to: 'JHS', distance: 230, maxSpeed: 120, status: 'clear', gradient: 0.5, electrified: true },
  { id: 'T09', from: 'JHS', to: 'BPL', distance: 290, maxSpeed: 110, status: 'clear', gradient: 0.8, electrified: true },
  { id: 'T10', from: 'BPL', to: 'NGP', distance: 350, maxSpeed: 120, status: 'clear', gradient: 0.3, electrified: true },
  { id: 'T11', from: 'NGP', to: 'HWH', distance: 1100, maxSpeed: 110, status: 'clear', gradient: 0.2, electrified: true },
  { id: 'T12', from: 'GZB', to: 'LKO', distance: 500, maxSpeed: 130, status: 'clear', gradient: 0.1, electrified: true },
  { id: 'T13', from: 'LKO', to: 'ALD', distance: 260, maxSpeed: 110, status: 'clear', gradient: 0.2, electrified: true },
  { id: 'T14', from: 'CNB', to: 'LKO', distance: 80, maxSpeed: 100, status: 'clear', gradient: 0, electrified: true },
  { id: 'T15', from: 'MGS', to: 'HWH', distance: 680, maxSpeed: 120, status: 'clear', gradient: 0.1, electrified: true },
];

export const initialTrains: Train[] = [
  {
    id: '12301', name: 'Rajdhani Express', type: 'superfast', priority: 1,
    route: ['NDLS', 'GZB', 'CNB', 'ALD', 'MGS', 'PNBE', 'HWH'],
    currentSectionIndex: 0, progress: 0.1, speed: 125, maxSpeed: 140,
    status: 'on-time', scheduledDeparture: 0, actualDeparture: 0, delay: 0,
    predictedDelay: 0, passengers: 580, direction: 'down', fuelEfficiency: 92, lastStationTime: 0,
  },
  {
    id: '12951', name: 'Mumbai Rajdhani', type: 'superfast', priority: 1,
    route: ['NDLS', 'AGC', 'JHS', 'BPL', 'NGP'],
    currentSectionIndex: 0, progress: 0.4, speed: 130, maxSpeed: 150,
    status: 'on-time', scheduledDeparture: 0, actualDeparture: 0, delay: 0,
    predictedDelay: 0, passengers: 620, direction: 'down', fuelEfficiency: 94, lastStationTime: 0,
  },
  {
    id: '12259', name: 'Duronto Express', type: 'superfast', priority: 2,
    route: ['NDLS', 'GZB', 'LKO', 'ALD', 'MGS', 'HWH'],
    currentSectionIndex: 1, progress: 0.3, speed: 110, maxSpeed: 130,
    status: 'on-time', scheduledDeparture: 0, actualDeparture: 0, delay: 0,
    predictedDelay: 0, passengers: 480, direction: 'down', fuelEfficiency: 88, lastStationTime: 0,
  },
  {
    id: '14055', name: 'Brahmaputra Mail', type: 'express', priority: 3,
    route: ['NDLS', 'GZB', 'CNB', 'ALD', 'MGS', 'PNBE', 'HWH'],
    currentSectionIndex: 2, progress: 0.6, speed: 80, maxSpeed: 110,
    status: 'delayed', scheduledDeparture: 0, actualDeparture: 0, delay: 12,
    predictedDelay: 15, passengers: 1200, direction: 'down', fuelEfficiency: 76, lastStationTime: 0,
  },
  {
    id: '15017', name: 'Gorakhpur Express', type: 'express', priority: 3,
    route: ['GZB', 'LKO', 'ALD'],
    currentSectionIndex: 0, progress: 0.7, speed: 90, maxSpeed: 110,
    status: 'on-time', scheduledDeparture: 0, actualDeparture: 0, delay: 0,
    predictedDelay: 2, passengers: 850, direction: 'down', fuelEfficiency: 80, lastStationTime: 0,
  },
  {
    id: '12381', name: 'Poorva Express', type: 'superfast', priority: 2,
    route: ['NDLS', 'AGC', 'JHS', 'BPL', 'NGP', 'HWH'],
    currentSectionIndex: 3, progress: 0.2, speed: 100, maxSpeed: 130,
    status: 'on-time', scheduledDeparture: 0, actualDeparture: 0, delay: 0,
    predictedDelay: 0, passengers: 520, direction: 'down', fuelEfficiency: 85, lastStationTime: 0,
  },
  {
    id: '53042', name: 'Goods Train HZ', type: 'freight', priority: 5,
    route: ['CNB', 'ALD', 'MGS', 'PNBE'],
    currentSectionIndex: 0, progress: 0.5, speed: 55, maxSpeed: 75,
    status: 'on-time', scheduledDeparture: 0, actualDeparture: 0, delay: 0,
    predictedDelay: 0, passengers: 0, direction: 'down', fuelEfficiency: 70, lastStationTime: 0,
  },
  {
    id: '22691', name: 'Vande Bharat', type: 'superfast', priority: 1,
    route: ['NDLS', 'GZB', 'CNB', 'LKO'],
    currentSectionIndex: 0, progress: 0, speed: 0, maxSpeed: 160,
    status: 'stopped', scheduledDeparture: 0, actualDeparture: 0, delay: 5,
    predictedDelay: 8, passengers: 400, direction: 'down', fuelEfficiency: 96, lastStationTime: 0,
  },
  {
    id: '12802', name: 'Purushottam Exp', type: 'superfast', priority: 2,
    route: ['NDLS', 'GZB', 'CNB', 'ALD', 'MGS', 'HWH'],
    currentSectionIndex: 4, progress: 0.1, speed: 115, maxSpeed: 130,
    status: 'on-time', scheduledDeparture: 0, actualDeparture: 0, delay: 0,
    predictedDelay: 0, passengers: 540, direction: 'down', fuelEfficiency: 89, lastStationTime: 0,
  },
  {
    id: '13050', name: 'Amritsar Exp', type: 'express', priority: 3,
    route: ['HWH', 'PNBE', 'MGS', 'ALD', 'CNB', 'GZB', 'NDLS'],
    currentSectionIndex: 1, progress: 0.4, speed: 85, maxSpeed: 110,
    status: 'delayed', scheduledDeparture: 0, actualDeparture: 0, delay: 8,
    predictedDelay: 10, passengers: 900, direction: 'up', fuelEfficiency: 78, lastStationTime: 0,
  },
];

export const scenarios: WhatIfScenario[] = [
  { id: 'S1', name: 'Signal Failure', description: 'Signal failure at Mughal Sarai junction', type: 'breakdown', params: { stationId: 'MGS', duration: 30 } },
  { id: 'S2', name: 'Heavy Fog', description: 'Dense fog reducing visibility on NDLS-GZB section', type: 'weather', params: { trackId: 'T01', speedReduction: 50 } },
  { id: 'S3', name: 'Track Congestion', description: 'Major congestion on Kanpur-Prayagraj corridor', type: 'congestion', params: { trackId: 'T03' } },
  { id: 'S4', name: 'Emergency Halt', description: 'Emergency stop of Rajdhani at Ghaziabad', type: 'delay', params: { trainId: '12301', delayMin: 25 } },
  { id: 'S5', name: 'Reroute Test', description: 'Reroute trains through Lucknow bypass', type: 'reroute', params: { avoidStation: 'CNB' } },
];
