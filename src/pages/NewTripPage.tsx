import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Truck, Clock, Loader2, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TopNav from '@/components/layout/TopNav';
import TripMap from '@/components/map/TripMap';
import { RoutePoint } from '@/types/trip';
import axios from 'axios';
import polyline from '@mapbox/polyline'; // Importation pour décoder la route

const API_URL = "http://127.0.0.1:8088/api/trips/";

const NewTripPage = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [loading, setLoading] = useState(false);
  const [routePoints, setRoutePoints] = useState<RoutePoint[] | null>(null);
  const [lastTripId, setLastTripId] = useState<number | null>(null);

  const token = localStorage.getItem("access");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLocation || !pickupLocation || !dropoffLocation) return;

    setLoading(true);
    try {
      // 1. On envoie les données au backend pour calculer la route
      const response = await axios.post(API_URL, {
        current_location: currentLocation,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        cycle_used_input: cycleUsed || "0",
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const tripData = response.data;
      setLastTripId(tripData.id);

      // 2. Décoder la polyline reçue du backend
      const decodedCoords = polyline.decode(tripData.polyline);
      
      // 3. Transformer en RoutePoint[] pour ton composant Map
      const newPoints: RoutePoint[] = decodedCoords.map((coord, index) => {
        let type = 'route';
        if (index === 0) type = 'start';
        if (index === Math.floor(decodedCoords.length / 2)) type = 'pickup';
        if (index === decodedCoords.length - 1) type = 'dropoff';

        return {
          lat: coord[0],
          lng: coord[1],
          type: type as any,
          label: index === 0 ? "Start" : index === decodedCoords.length - 1 ? "Destination" : ""
        };
      });

      setRoutePoints(newPoints);
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = () => {
    if (lastTripId) {
      navigate(`/logs/${lastTripId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav title="New Trip" />
      <div className="p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-xl p-8 bg-card border border-border shadow-xl"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Route className="w-5 h-5 text-primary" />
              Trip Details
            </h2>

            <form onSubmit={handleGenerate} className="space-y-5">
              <TripInput
                icon={<Navigation className="w-4 h-4" />}
                label="Current Location"
                placeholder="e.g., Washington, D.C."
                value={currentLocation}
                onChange={setCurrentLocation}
              />
              <TripInput
                icon={<MapPin className="w-4 h-4" />}
                label="Pickup Location"
                placeholder="e.g., Richmond, VA"
                value={pickupLocation}
                onChange={setPickupLocation}
              />
              <TripInput
                icon={<MapPin className="w-4 h-4" />}
                label="Dropoff Location"
                placeholder="e.g., Newark, NJ"
                value={dropoffLocation}
                onChange={setDropoffLocation}
              />
              <TripInput
                icon={<Clock className="w-4 h-4" />}
                label="Current Cycle Used (hours)"
                placeholder="e.g., 14"
                value={cycleUsed}
                onChange={setCycleUsed}
                type="number"
              />

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white mt-4"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <><Truck className="w-5 h-5 mr-2" /> Generate Route & Logs</>
                )}
              </Button>

              {routePoints && (
                <Button
                  type="button"
                  onClick={handleSaveTrip}
                  className="w-full h-12 text-base font-semibold bg-transparent border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 mt-2"
                >
                  View Details & Logs
                </Button>
              )}
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-xl overflow-hidden min-h-[500px] border border-border shadow-xl bg-card"
          >
            <TripMap routePoints={routePoints} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const TripInput = ({ icon, label, placeholder, value, onChange, type = 'text' }: any) => (
  <div>
    <label className="text-sm font-medium text-muted-foreground mb-2 block">{label}</label>
    <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 px-4 h-12 transition-all focus-within:border-primary/50">
      <span className="text-muted-foreground">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
      />
    </div>
  </div>
);

export default NewTripPage;