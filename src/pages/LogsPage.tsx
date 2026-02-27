import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import TopNav from '@/components/layout/TopNav';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8088/api/trips/";

const LogsPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);

  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!token) return;

    // 🔥 afficher le token dans F12
    console.log("JWT Access Token:", token);

    axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setTrips(res.data);
    })
    .catch(err => {
      console.error("Error fetching trips:", err);
    });

  }, [token]);

  return (
    <div>
      <TopNav title="Logs" />
      <div className="p-8">
        <div className="space-y-4">

          {trips.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-6 flex items-center justify-between hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => navigate(`/logs/${trip.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    ELD Log — {new Date(trip.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {trip.pickup_location} → {trip.dropoff_location}
                  </p>
                </div>
              </div>

              <span className="text-sm text-muted-foreground">
                {trip.total_miles?.toFixed(0)} mi
              </span>
            </motion.div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default LogsPage;