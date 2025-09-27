export type TrackType = 'Main' | 'Siding' | 'Junction';

export interface TrackSegment {
  id: string;
  name: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  position: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  length: number;
  maxSpeed: number;
  isOccupied: boolean;
  type: TrackType;
}

export interface Train {
  id: string;
  name: string;
  type: 'Express' | 'Freight' | 'Local';
  status: 'On Time' | 'Delayed' | 'Critical';
  zone: string;
  route: string;
  currentSpeed: number;
  maxSpeed: number;
  delay: number;
  priority: number;
  destination: string;
  currentTrack?: TrackSegment;
  position: number; // 0-100 percentage along track
  direction: 'East' | 'West' | 'North' | 'South';
  nextStation?: string;
  estimatedArrival?: string;
  lastUpdated: string;
  // Additional properties for map visualization
  lat: number;
  lng: number;
  heading: number; // Direction in degrees (0-360)
  lastUpdate?: number;
}

export interface TrackSegment {
  id: string;
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isOccupied: boolean;
  maxSpeed: number;
  type: 'Main' | 'Siding' | 'Junction';
}

export interface AIRecommendation {
  id: string;
  type: 'Hold' | 'Reroute' | 'Priority' | 'Speed';
  trainId: string;
  description: string;
  impact: string;
  confidence: number;
  estimatedDelay: number;
  isAccepted?: boolean;
}

export interface KPIData {
  totalTrains: number;
  averageDelay: number;
  throughput: number;
  utilization: number;
}