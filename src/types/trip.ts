export interface Trip {
  id: string;
  date: string;
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
  cycleUsed: number;
  totalMiles: number;
  totalHours: number;
  status: 'planned' | 'in_progress' | 'completed';
  logSegments: LogSegment[];
}

export type DutyStatus = 'OFF' | 'SLEEPER' | 'DRIVING' | 'ON';

export interface LogSegment {
  start: number;
  end: number;
  status: DutyStatus;
}

export interface LogHeader {
  driverName: string;
  date: string;
  truckId: string;
  carrier: string;
  from: string;
  to: string;
  totalMiles: number;
  cycleUsed: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  label?: string;
  type: 'start' | 'pickup' | 'dropoff' | 'fuel' | 'rest';
}
