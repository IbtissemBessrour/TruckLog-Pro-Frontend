import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Eye, Loader2, AlertCircle, Calendar, Route, Trash2 } from 'lucide-react';
import axios from 'axios';
import TopNav from '@/components/layout/TopNav';

const API_URL = "http://127.0.0.1:8088/api/trips/";

interface Trip {
  id: number;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  total_miles: number;
  total_duration: number;
  created_at: string;
}

const SavedTripsPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("access");

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (err) {
      setError("Failed to load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [token]);

  // Fonction de suppression
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Empêche la navigation vers /logs/id quand on clique sur la poubelle
    
    if (!window.confirm("Are you sure you want to delete this trip?")) return;

    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Mise à jour locale de la liste après suppression
      setTrips(trips.filter(trip => trip.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Could not delete the trip.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav title="Saved Trips" />
      
      <div className="p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {trips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card group rounded-xl p-5 flex items-center justify-between hover:bg-secondary/5 hover:border-primary/30 transition-all cursor-pointer border border-border/50"
                  onClick={() => navigate(`/logs/${trip.id}`)}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1 text-foreground font-bold text-lg">
                        <span>{trip.pickup_location}</span>
                        <span className="text-muted-foreground/30">→</span>
                        <span>{trip.dropoff_location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(trip.created_at)}</span>
                        <span>•</span>
                        <span>{Math.round(trip.total_miles)} mi</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bouton Voir */}
                    <button className="p-2.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-primary/20">
                      <Eye className="w-5 h-5" />
                    </button>

                    {/* Bouton Supprimer */}
                    <button 
                      onClick={(e) => handleDelete(e, trip.id)}
                      disabled={deletingId === trip.id}
                      className="p-2.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors border border-transparent hover:border-destructive/20"
                    >
                      {deletingId === trip.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!loading && trips.length === 0 && (
              <div className="text-center py-20 opacity-40">
                <Route className="w-12 h-12 mx-auto mb-2" />
                <p>No trips found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedTripsPage;