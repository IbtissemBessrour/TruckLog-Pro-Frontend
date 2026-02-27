import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RoutePoint } from '@/types/trip';
import { MapPin, Navigation } from 'lucide-react';

// Icônes circulaires avec un design "Flat" et une bordure épaisse
const createStyledIcon = (color: string) =>
  new L.DivIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: white;
        border: 4px solid ${color};
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 4px; height: 4px; background: ${color}; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

const icons: Record<string, L.DivIcon> = {
  start: createStyledIcon('#3b82f6'),   // Bleu (Départ)
  pickup: createStyledIcon('#10b981'),  // Vert (Chargement)
  dropoff: createStyledIcon('#ef4444'), // Rouge (Livraison)
  fuel: createStyledIcon('#f59e0b'),    // Orange (Essence)
  rest: createStyledIcon('#8b5cf6'),    // Violet (Repos)
};

const FitBounds = ({ points }: { points: RoutePoint[] }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [points, map]);
  return null;
};

const MapView = ({ routePoints }: { routePoints: RoutePoint[] }) => {
  const positions: [number, number][] = routePoints.map(p => [p.lat, p.lng]);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[positions[0][0], positions[0][1]]}
        zoom={10}
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
      >
        {/* Style de carte CLAIR et ÉPURÉ (CartoDB Positron) */}
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Tracé de la route - Bleu moderne avec ombre légère */}
        <Polyline 
          positions={positions} 
          pathOptions={{ 
            color: '#3b82f6', 
            weight: 5, 
            opacity: 0.8,
            lineJoin: 'round'
          }} 
        />

        {routePoints
          .filter(p => ['start', 'pickup', 'dropoff', 'fuel', 'rest'].includes(p.type))
          .map((point, i) => (
            <Marker key={i} position={[point.lat, point.lng]} icon={icons[point.type]}>
              <Popup>
                <div className="p-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{point.type}</p>
                  <p className="text-sm font-semibold text-slate-800">{point.label || "Point d'arrêt"}</p>
                </div>
              </Popup>
            </Marker>
        ))}
        
        <FitBounds points={routePoints} />
      </MapContainer>

      {/* Bouton de recentrage flottant */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm border border-slate-200">
          <Navigation className="w-4 h-4 text-blue-600" />
        </div>
      </div>
    </div>
  );
};

const EmptyMap = () => (
  <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-400">
    <MapPin className="w-12 h-12 mb-2 opacity-20" />
    <p className="text-sm font-medium">En attente d'un itinéraire...</p>
  </div>
);

const TripMap = ({ routePoints }: { routePoints: RoutePoint[] | null }) => {
  return (
    <div className="h-full w-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
      {!routePoints || routePoints.length === 0 ? <EmptyMap /> : <MapView routePoints={routePoints} />}
    </div>
  );
};

export default TripMap;