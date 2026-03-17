import { Station, TrackSection, Train } from './railway-types';

export const stations: Station[] = [
  { id: 'ST1', name: 'Central', x: 50, y: 200 },
  { id: 'ST2', name: 'Northgate', x: 200, y: 80 },
  { id: 'ST3', name: 'Eastfield', x: 400, y: 120 },
  { id: 'ST4', name: 'Southport', x: 200, y: 320 },
  { id: 'ST5', name: 'Westbury', x: 400, y: 300 },
  { id: 'ST6', name: 'Junction', x: 300, y: 200 },
  { id: 'ST7', name: 'Terminal', x: 550, y: 200 },
];

export const tracks: TrackSection[] = [
  { id: 'T1', from: 'ST1', to: 'ST2', distance: 15, maxSpeed: 120, status: 'clear' },
  { id: 'T2', from: 'ST1', to: 'ST4', distance: 12, maxSpeed: 100, status: 'clear' },
  { id: 'T3', from: 'ST2', to: 'ST6', distance: 10, maxSpeed: 130, status: 'clear' },
  { id: 'T4', from: 'ST2', to: 'ST3', distance: 20, maxSpeed: 110, status: 'clear' },
  { id: 'T5', from: 'ST4', to: 'ST6', distance: 10, maxSpeed: 100, status: 'clear' },
  { id: 'T6', from: 'ST4', to: 'ST5', distance: 18, maxSpeed: 90, status: 'clear' },
  { id: 'T7', from: 'ST6', to: 'ST3', distance: 12, maxSpeed: 120, status: 'clear' },
  { id: 'T8', from: 'ST6', to: 'ST5', distance: 10, maxSpeed: 110, status: 'clear' },
  { id: 'T9', from: 'ST3', to: 'ST7', distance: 16, maxSpeed: 140, status: 'clear' },
  { id: 'T10', from: 'ST5', to: 'ST7', distance: 16, maxSpeed: 130, status: 'clear' },
  { id: 'T11', from: 'ST6', to: 'ST7', distance: 25, maxSpeed: 150, status: 'clear' },
];

export const initialTrains: Train[] = [
  {
    id: 'TR001', name: 'Rajdhani Express', type: 'express', priority: 1,
    route: ['ST1', 'ST2', 'ST6', 'ST7'], currentSectionIndex: 0, progress: 0,
    speed: 110, maxSpeed: 140, status: 'on-time',
    scheduledTime: 0, actualTime: 0, delay: 0, predictedDelay: 0, passengers: 482,
  },
  {
    id: 'TR002', name: 'Shatabdi Local', type: 'local', priority: 3,
    route: ['ST1', 'ST4', 'ST5', 'ST7'], currentSectionIndex: 0, progress: 0.3,
    speed: 80, maxSpeed: 100, status: 'on-time',
    scheduledTime: 0, actualTime: 0, delay: 0, predictedDelay: 0, passengers: 320,
  },
  {
    id: 'TR003', name: 'Duronto Freight', type: 'freight', priority: 5,
    route: ['ST1', 'ST4', 'ST6', 'ST3', 'ST7'], currentSectionIndex: 1, progress: 0.5,
    speed: 60, maxSpeed: 80, status: 'on-time',
    scheduledTime: 0, actualTime: 0, delay: 0, predictedDelay: 0, passengers: 0,
  },
  {
    id: 'TR004', name: 'Garib Rath', type: 'express', priority: 2,
    route: ['ST1', 'ST2', 'ST3', 'ST7'], currentSectionIndex: 0, progress: 0.7,
    speed: 100, maxSpeed: 130, status: 'on-time',
    scheduledTime: 0, actualTime: 0, delay: 0, predictedDelay: 0, passengers: 560,
  },
  {
    id: 'TR005', name: 'Vande Bharat', type: 'express', priority: 1,
    route: ['ST1', 'ST6', 'ST7'], currentSectionIndex: 0, progress: 0,
    speed: 0, maxSpeed: 150, status: 'stopped',
    scheduledTime: 0, actualTime: 0, delay: 2, predictedDelay: 3, passengers: 400,
  },
  {
    id: 'TR006', name: 'Jan Shatabdi', type: 'local', priority: 4,
    route: ['ST4', 'ST6', 'ST3', 'ST7'], currentSectionIndex: 0, progress: 0.1,
    speed: 70, maxSpeed: 90, status: 'on-time',
    scheduledTime: 0, actualTime: 0, delay: 0, predictedDelay: 0, passengers: 250,
  },
];
