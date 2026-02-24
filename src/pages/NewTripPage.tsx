import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Truck, Clock, Loader2, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TopNav from '@/components/layout/TopNav';
import TripMap from '@/components/map/TripMap';
import { mockRoute, generateLogSegments } from '@/services/mockData';
import { RoutePoint } from '@/types/trip';

const NewTripPage = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [loading, setLoading] = useState(false);
  const [routePoints, setRoutePoints] = useState<RoutePoint[] | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setRoutePoints(mockRoute);
    setLoading(false);
  };

  const handleSaveTrip = () => {
    navigate('/logs/1');
  };

  return (
    <div>
      <TopNav title="New Trip" />
      <div className="p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-xl p-8"
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
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Truck className="w-5 h-5 mr-2" />
                    Generate Route & Logs
                  </>
                )}
              </Button>

              {routePoints && (
                <Button
                  type="button"
                  onClick={handleSaveTrip}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-primary/30 text-primary hover:bg-primary/10"
                >
                  View Generated Logs
                </Button>
              )}
            </form>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-xl overflow-hidden min-h-[500px]"
          >
            <TripMap routePoints={routePoints} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const TripInput = ({
  icon, label, placeholder, value, onChange, type = 'text',
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <div>
    <label className="text-sm font-medium text-muted-foreground mb-2 block">{label}</label>
    <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-4 h-12 input-glow transition-all">
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
