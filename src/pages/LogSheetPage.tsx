import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import TopNav from '@/components/layout/TopNav';
import ELDGrid from '@/components/eld/ELDGrid';
import { mockTrips, defaultLogSegments } from '@/services/mockData';
import { LogSegment, DutyStatus, LogHeader } from '@/types/trip';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const STATUS_LABELS: Record<DutyStatus, string> = {
  OFF: 'Off Duty',
  SLEEPER: 'Sleeper Berth',
  DRIVING: 'Driving',
  ON: 'On Duty',
};

const LogSheetPage = () => {
  const { tripId } = useParams();
  const [exporting, setExporting] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const trip = mockTrips.find(t => t.id === tripId);
  const segments = trip?.logSegments || defaultLogSegments;

  const header: LogHeader = {
    driverName: 'John E. Doe',
    date: trip?.date || '2026-02-24',
    truckId: '123',
    carrier: "Doe's Transportation",
    from: trip?.currentLocation || 'Washington, D.C.',
    to: trip?.dropoffLocation || 'Newark, NJ',
    totalMiles: trip?.totalMiles || 350,
    cycleUsed: trip?.cycleUsed || 14,
  };

  const totals: Record<DutyStatus, number> = { OFF: 0, SLEEPER: 0, DRIVING: 0, ON: 0 };
  segments.forEach(s => { totals[s.status] += s.end - s.start; });

  const handleExportPDF = async () => {
    if (!logRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(logRef.current, {
        backgroundColor: '#0a0f1e',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`eld-log-${header.date}.pdf`);
    } catch (err) {
      console.error(err);
    }
    setExporting(false);
  };

  return (
    <div>
      <TopNav title="ELD Log Sheet" />
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Driver's Daily Log
          </h2>
          <Button
            onClick={handleExportPDF}
            disabled={exporting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Download Official ELD Log
          </Button>
        </div>

        <motion.div
          ref={logRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-foreground tracking-wide">DRIVER'S DAILY LOG</h3>
              <p className="text-xs text-muted-foreground">U.S. DEPARTMENT OF TRANSPORTATION — ONE CALENDAR DAY — 24 HOURS</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <HeaderField label="Date" value={header.date} />
              <HeaderField label="Driver Name" value={header.driverName} />
              <HeaderField label="Truck ID" value={header.truckId} />
              <HeaderField label="Carrier" value={header.carrier} />
              <HeaderField label="From" value={header.from} />
              <HeaderField label="To" value={header.to} />
              <HeaderField label="Total Miles" value={String(header.totalMiles)} />
              <HeaderField label="Cycle Used" value={`${header.cycleUsed}h`} />
            </div>
          </div>

          {/* 24-Hour Grid */}
          <div className="p-6">
            <ELDGrid segments={segments} />
          </div>

          {/* Totals */}
          <div className="p-6 border-t border-border">
            <h4 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Hours Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.keys(totals) as DutyStatus[]).map(status => (
                <div key={status} className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">{STATUS_LABELS[status]}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totals[status].toFixed(totals[status] % 1 === 0 ? 0 : 1)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">hrs</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-3xl font-bold text-primary">
                {Object.values(totals).reduce((a, b) => a + b, 0)}
                <span className="text-sm font-normal text-muted-foreground ml-1">hours</span>
              </p>
            </div>
          </div>

          {/* Signature */}
          <div className="p-6 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Driver Signature</p>
              <div className="border-b border-muted-foreground/30 w-48 h-8" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Date</p>
              <p className="text-sm font-medium text-foreground">{header.date}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const HeaderField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-semibold text-foreground">{value}</p>
  </div>
);

export default LogSheetPage;
