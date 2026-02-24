import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, MapPin, Eye } from 'lucide-react';
import TopNav from '@/components/layout/TopNav';
import { mockTrips } from '@/services/mockData';

const SavedTripsPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <TopNav title="Saved Trips" />
      <div className="p-8">
        <div className="space-y-4">
          {mockTrips.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-6 flex items-center justify-between hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => navigate(`/logs/${trip.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">{trip.pickupLocation} → {trip.dropoffLocation}</p>
                  <p className="text-sm text-muted-foreground">{trip.date} · {trip.totalMiles} mi · {trip.totalHours}h driving</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  trip.status === 'completed' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                }`}>
                  {trip.status}
                </span>
                <button className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedTripsPage;
