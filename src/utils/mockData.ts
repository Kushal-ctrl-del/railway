import { Train, TrackSegment, AIRecommendation, KPIData } from '../types/train';

export const mockTrains: Train[] = [
  {
    id: 'EXP001',
    name: 'Express 001',
    type: 'Express',
    status: 'On Time',
    currentSpeed: 85,
    maxSpeed: 120,
    delay: 0,
    priority: 8,
    destination: 'Terminal East',
    currentTrack: 'Main-1',
    position: 25,
    direction: 'East'
  },
  {
    id: 'FRT205',
    name: 'Freight 205',
    type: 'Freight',
    status: 'Delayed',
    currentSpeed: 45,
    maxSpeed: 80,
    delay: 12,
    priority: 3,
    destination: 'Yard B',
    currentTrack: 'Main-2',
    position: 65,
    direction: 'West'
  },
  {
    id: 'LOC412',
    name: 'Local 412',
    type: 'Local',
    status: 'On Time',
    currentSpeed: 60,
    maxSpeed: 90,
    delay: 2,
    priority: 5,
    destination: 'Station C',
    currentTrack: 'Siding-1',
    position: 80,
    direction: 'East'
  },
  {
    id: 'EXP003',
    name: 'Express 003',
    type: 'Express',
    status: 'Critical',
    currentSpeed: 0,
    maxSpeed: 120,
    delay: 25,
    priority: 9,
    destination: 'Terminal West',
    currentTrack: 'Main-1',
    position: 45,
    direction: 'West'
  }
];

export const mockTracks: TrackSegment[] = [
  {
    id: 'Main-1',
    name: 'Main Track 1',
    startX: 50,
    startY: 200,
    endX: 750,
    endY: 200,
    isOccupied: true,
    maxSpeed: 120,
    type: 'Main'
  },
  {
    id: 'Main-2',
    name: 'Main Track 2',
    startX: 50,
    startY: 250,
    endX: 750,
    endY: 250,
    isOccupied: true,
    maxSpeed: 120,
    type: 'Main'
  },
  {
    id: 'Siding-1',
    name: 'Siding 1',
    startX: 300,
    startY: 150,
    endX: 500,
    endY: 150,
    isOccupied: true,
    maxSpeed: 60,
    type: 'Siding'
  },
  {
    id: 'Junction-A',
    name: 'Junction A',
    startX: 300,
    startY: 200,
    endX: 300,
    endY: 150,
    isOccupied: false,
    maxSpeed: 40,
    type: 'Junction'
  }
];

export const mockRecommendations: AIRecommendation[] = [
  {
    id: 'REC001',
    type: 'Hold',
    trainId: 'LOC412',
    description: 'Hold Local 412 at Station C for 8 minutes to allow Express 003 priority passage',
    impact: 'Reduces system delay by 15 minutes',
    confidence: 92,
    estimatedDelay: 8
  },
  {
    id: 'REC002',
    type: 'Reroute',
    trainId: 'FRT205',
    description: 'Route Freight 205 via Siding Track to avoid Main Line congestion',
    impact: 'Improves throughput by 12%',
    confidence: 87,
    estimatedDelay: 5
  },
  {
    id: 'REC003',
    type: 'Speed',
    trainId: 'EXP001',
    description: 'Increase Express 001 speed to 95 km/h to maintain schedule',
    impact: 'Maintains on-time performance',
    confidence: 95,
    estimatedDelay: 0
  }
];

export const mockKPIs: KPIData = {
  totalTrains: 47,
  averageDelay: 8.5,
  throughput: 24,
  utilization: 78
};