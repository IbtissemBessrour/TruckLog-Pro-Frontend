import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Clock, Battery } from 'lucide-react';
import TopNav from '@/components/layout/TopNav';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8088/api/trips/";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);

  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!token) return;

    // 🔥 afficher token dans console (F12)
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

  // ✅ Calcul dynamique
  const totalTrips = trips.length;
  const totalMiles = trips.reduce((sum, t) => sum + (t.total_miles || 0), 0);
  const hoursUsed = trips.reduce((sum, t) => sum + (t.total_duration || 0), 0);
  const remainingHours = Math.max(0, 70 - hoursUsed);

  const stats = [
    { label: 'Total Trips', value: totalTrips, icon: TrendingUp, color: 'text-primary' },
    { label: 'Total Miles', value: `${totalMiles.toFixed(0)} mi`, icon: MapPin, color: 'text-success' },
    { label: 'Hours Used', value: `${hoursUsed.toFixed(1)}h`, icon: Clock, color: 'text-warning' },
    { label: 'Remaining Hours', value: `${remainingHours.toFixed(1)}h`, icon: Battery, color: 'text-info' },
  ];

  return (
    <div>
      <TopNav title="Dashboard" />
      <div className="p-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-foreground">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Recent Trips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Trips</h2>
            <button
              onClick={() => navigate('/trips/new')}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              + New Trip
            </button>
          </div>

          <div className="divide-y divide-border">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="p-6 flex items-center justify-between hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/logs/${trip.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {trip.pickup_location} → {trip.dropoff_location}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.created_at).toLocaleDateString()} · {trip.total_miles?.toFixed(0)} miles
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/15 text-success">
                  Saved
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default DashboardPage;