import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import TopNav from '@/components/layout/TopNav';
import ELDGrid from '@/components/eld/ELDGrid';
import { LogSegment, DutyStatus, LogHeader } from '@/types/trip';
import { generateELDVipPDF } from '@/services/logExportService';

// --- CONFIGURATION ---
const STATUS_LABELS: Record<string, string> = {
  OFF: 'Off Duty',
  SLEEPER: 'Sleeper Berth',
  DRIVING: 'Driving',
  ON: 'On Duty (Not Driving)'
};

const STATUS_ORDER: DutyStatus[] = ['OFF', 'SLEEPER', 'DRIVING', 'ON'];

// --- COMPOSANT TOTALS ---
const Totals = ({ totals }: { totals: Record<string, number> }) => (
  <div className="p-6 border-t border-border bg-card/20">
    <h4 className="text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em]">
      24-Hour Period Summary 
    </h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STATUS_ORDER.map((status) => {
        const value = totals[status] || 0;
        return (
          <div key={status} className="bg-secondary/30 rounded-lg p-4 border border-border/40 backdrop-blur-sm">
            <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-tight">
              {STATUS_LABELS[status]}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {value.toFixed(1)}
              <span className="text-xs font-normal text-muted-foreground ml-1">hrs</span>
            </p>
            <div className="mt-2 h-1 w-full bg-muted/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary/50 transition-all duration-500" 
                style={{ width: `${Math.min((value / 24) * 100, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// --- PAGE PRINCIPALE ---
const LogSheetPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const [segments, setSegments] = useState<LogSegment[]>([]);
  const [header, setHeader] = useState<LogHeader>({
    driverName: '', date: '', truckId: '', carrier: '', from: '', to: '', totalMiles: 0, cycleUsed: 0,
  });

  const [backendTotals, setBackendTotals] = useState<Record<string, number>>({
    OFF: 0, SLEEPER: 0, DRIVING: 0, ON: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      
      if (!token) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      try {
        const [resUser, resTrip, resLogs] = await Promise.all([
          fetch('http://127.0.0.1:8088/api/auth/profile/', { headers }),
          fetch(`http://127.0.0.1:8088/api/trips/${tripId}/`, { headers }),
          fetch(`http://127.0.0.1:8088/api/trips/${tripId}/logs/`, { headers })
        ]);

        if (resUser.status === 401) throw new Error("Non autorisé");

        const userData = await resUser.json();
        const tripData = await resTrip.json();
        const logsData = await resLogs.json();

        // CORRECTIF ICI : On prend le premier élément du tableau de logs
        const currentLog = logsData[0] || {};

        // 1. Mise à jour de l'en-tête
        setHeader({
          driverName: userData.username || '—',
          date: currentLog.date || tripData.created_at?.split('T')[0] || '',
          truckId: userData.truck_id || '—',
          carrier: userData.carrier || '—',
          from: tripData.pickup_location || '—',
          to: tripData.dropoff_location || '—',
          totalMiles: Math.round(tripData.total_miles || 0),
          cycleUsed: parseFloat(tripData.cycle_used_input) || 0,
        });

        // 2. Segments pour la courbe ELD
        setSegments(currentLog.segments || []);

        // 3. Totaux du Backend (Mapping correct avec les noms de votre JSON)
        setBackendTotals({
          OFF: currentLog.total_off_duty || 0,
          SLEEPER: currentLog.total_sleeper || 0,
          DRIVING: currentLog.total_driving || 0,
          ON: currentLog.total_on_duty || 0
        });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (tripId) fetchData();
  }, [tripId]);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await generateELDVipPDF(header, segments, backendTotals);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav title="Fiche Journalière" />
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl"><FileText className="text-primary" /></div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Daily Log Sheet</h2>
              <p className="text-xs text-muted-foreground font-mono">TRIP ID: #{tripId}</p>
            </div>
          </div>
          <Button onClick={handleExportPDF} disabled={exporting}>
            {exporting ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Download className="mr-2 w-4 h-4" />}
            Exporter PDF
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="glass-card rounded-2xl overflow-hidden border border-border shadow-2xl bg-card"
        >
          {/* Header */}
          <div className="p-8 border-b border-border bg-card/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Field label="Driver" value={header.driverName} />
              <Field label="Date" value={header.date} />
              <Field label="Truck" value={header.truckId} />
              <Field label="Carrier" value={header.carrier} />
              <Field label="From" value={header.from} />
              <Field label="To" value={header.to} />
              <Field label="Miles" value={`${header.totalMiles} mi`} />
              <Field label="Cycle" value={`${header.cycleUsed}h`} />
            </div>
          </div>

          {/* LA COURBE (Grid) */}
          <div className="p-8 bg-white/5 min-h-[350px]">
            <ELDGrid segments={segments} />
          </div>

          {/* LES TOTAUX DYNAMIQUES */}
          <Totals totals={backendTotals} />

          {/* Signature */}
          <div className="p-8 border-t border-border flex justify-between items-end bg-card/30">
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-black">Certifié par le conducteur</p>
              <div className="border-b-2 border-primary/20 w-72 h-12 flex items-center font-serif italic text-2xl text-primary/80 px-2">
                {header.driverName}
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <ShieldCheck className="text-emerald-500 w-6 h-6 mb-1" />
              <p className="text-[10px] text-muted-foreground uppercase font-black">Date de validation</p>
              <span className="font-mono text-sm font-bold">{header.date}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{label}</p>
    <p className="text-sm font-bold border-b border-border pb-1 truncate">{value || "—"}</p>
  </div>
);

export default LogSheetPage;