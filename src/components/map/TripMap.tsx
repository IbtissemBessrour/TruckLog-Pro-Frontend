import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RoutePoint } from '@/types/trip';
import { MapPin } from 'lucide-react';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (color: string) =>
  new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const icons: Record<string, L.DivIcon> = {
  start: createIcon('hsl(210, 100%, 56%)'),
  pickup: createIcon('hsl(142, 76%, 46%)'),
  dropoff: createIcon('hsl(0, 72%, 51%)'),
  fuel: createIcon('hsl(38, 92%, 50%)'),
  rest: createIcon('hsl(262, 83%, 58%)'),
};

const FitBounds = ({ points }: { points: RoutePoint[] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
};

const EmptyMap = () => (
  <div className="flex items-center justify-center h-full min-h-[500px] text-muted-foreground">
    <div className="text-center">
      <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="text-sm">Generate a route to see it on the map</p>
    </div>
  </div>
);

const MapView = ({ routePoints }: { routePoints: RoutePoint[] }) => {
  const positions: [number, number][] = routePoints.map(p => [p.lat, p.lng]);

  return (
    <MapContainer
      center={[39, -76]}
      zoom={7}
      style={{ height: '100%', minHeight: '500px', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={positions} pathOptions={{ color: 'hsl(210, 100%, 56%)', weight: 4, opacity: 0.8 }} />
      {routePoints.map((point, i) => (
        <Marker key={i} position={[point.lat, point.lng]} icon={icons[point.type]}>
          <Popup>
            <div className="text-sm font-medium">{point.label}</div>
            <div className="text-xs capitalize">{point.type}</div>
          </Popup>
        </Marker>
      ))}
      <FitBounds points={routePoints} />
    </MapContainer>
  );
};

const TripMap = ({ routePoints }: { routePoints: RoutePoint[] | null }) => {
  if (!routePoints) return <EmptyMap />;
  return <MapView routePoints={routePoints} />;
};

export default TripMap;
