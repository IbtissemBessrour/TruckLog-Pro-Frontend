import { Trip, LogSegment, RoutePoint } from '@/types/trip';

export const mockTrips: Trip[] = [
  {
    id: '1',
    date: '2026-02-20',
    currentLocation: 'Washington, D.C.',
    pickupLocation: 'Richmond, VA',
    dropoffLocation: 'Newark, NJ',
    cycleUsed: 14,
    totalMiles: 350,
    totalHours: 10,
    status: 'completed',
    logSegments: [
      { start: 0, end: 6, status: 'OFF' },
      { start: 6, end: 6.5, status: 'ON' },
      { start: 6.5, end: 11, status: 'DRIVING' },
      { start: 11, end: 11.5, status: 'ON' },
      { start: 11.5, end: 12.5, status: 'OFF' },
      { start: 12.5, end: 17, status: 'DRIVING' },
      { start: 17, end: 17.5, status: 'ON' },
      { start: 17.5, end: 24, status: 'OFF' },
    ],
  },
  {
    id: '2',
    date: '2026-02-22',
    currentLocation: 'Newark, NJ',
    pickupLocation: 'Philadelphia, PA',
    dropoffLocation: 'Baltimore, MD',
    cycleUsed: 24,
    totalMiles: 200,
    totalHours: 6,
    status: 'completed',
    logSegments: [
      { start: 0, end: 7, status: 'OFF' },
      { start: 7, end: 7.5, status: 'ON' },
      { start: 7.5, end: 13, status: 'DRIVING' },
      { start: 13, end: 13.5, status: 'ON' },
      { start: 13.5, end: 24, status: 'OFF' },
    ],
  },
];

export const dashboardStats = {
  totalTrips: 24,
  totalMiles: 8420,
  hoursUsed: 34,
  remainingHours: 36,
};

export const defaultLogSegments: LogSegment[] = [
  { start: 0, end: 6, status: 'OFF' },
  { start: 6, end: 7, status: 'ON' },
  { start: 7, end: 17, status: 'DRIVING' },
  { start: 17, end: 18, status: 'ON' },
  { start: 18, end: 24, status: 'OFF' },
];

export const mockRoute: RoutePoint[] = [
  { lat: 38.9072, lng: -77.0369, label: 'Washington, D.C.', type: 'start' },
  { lat: 37.5407, lng: -77.4360, label: 'Richmond, VA', type: 'pickup' },
  { lat: 38.3285, lng: -77.4610, label: 'Fredericksburg, VA', type: 'rest' },
  { lat: 39.2904, lng: -76.6122, label: 'Baltimore, MD', type: 'fuel' },
  { lat: 39.9526, lng: -75.1652, label: 'Philadelphia, PA', type: 'rest' },
  { lat: 40.0583, lng: -74.4057, label: 'Cherry Hill, NJ', type: 'fuel' },
  { lat: 40.7357, lng: -74.1724, label: 'Newark, NJ', type: 'dropoff' },
];

export function generateLogSegments(drivingHours: number, cycleUsed: number): LogSegment[] {
  const segments: LogSegment[] = [];
  const startDriving = 6;
  const breakAfter = Math.min(drivingHours, 5);
  
  segments.push({ start: 0, end: startDriving, status: 'OFF' });
  segments.push({ start: startDriving, end: startDriving + 0.5, status: 'ON' });
  segments.push({ start: startDriving + 0.5, end: startDriving + 0.5 + breakAfter, status: 'DRIVING' });
  
  const afterFirstDrive = startDriving + 0.5 + breakAfter;
  
  if (drivingHours > breakAfter) {
    segments.push({ start: afterFirstDrive, end: afterFirstDrive + 0.5, status: 'ON' });
    segments.push({ start: afterFirstDrive + 0.5, end: afterFirstDrive + 1.5, status: 'SLEEPER' });
    const remainingDrive = drivingHours - breakAfter;
    const resumeAt = afterFirstDrive + 1.5;
    segments.push({ start: resumeAt, end: resumeAt + remainingDrive, status: 'DRIVING' });
    const endDrive = resumeAt + remainingDrive;
    segments.push({ start: endDrive, end: endDrive + 0.5, status: 'ON' });
    segments.push({ start: endDrive + 0.5, end: 24, status: 'OFF' });
  } else {
    segments.push({ start: afterFirstDrive, end: afterFirstDrive + 0.5, status: 'ON' });
    segments.push({ start: afterFirstDrive + 0.5, end: 24, status: 'OFF' });
  }
  
  return segments;
}
