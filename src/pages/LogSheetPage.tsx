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

const STATUS_LABELS: Record<DutyStatus, string> = {
  OFF: 'Off Duty',
  SLEEPER: 'Sleeper Berth',
  DRIVING: 'Driving',
  ON: 'On Duty (Not Driving)',
};

const STATUS_ORDER: DutyStatus[] = ['OFF', 'SLEEPER', 'DRIVING', 'ON'];

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
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const W = 297;
      const H = 210;
      const M = 15; // margin
      const cW = W - 2 * M; // content width

      // Colors
      const BLACK: [number, number, number] = [0, 0, 0];
      const GRAY: [number, number, number] = [120, 120, 120];
      const LIGHT_GRAY: [number, number, number] = [200, 200, 200];

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(...BLACK);
      pdf.text("DRIVER'S DAILY LOG", W / 2, M + 5, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(...GRAY);
      pdf.text('(24 Hours) — U.S. Department of Transportation — Federal Motor Carrier Safety Administration', W / 2, M + 10, { align: 'center' });
      pdf.text('Original — File at home terminal. Duplicate — Driver retains in his/her possession for 8 days.', W / 2, M + 14, { align: 'center' });

      // Header fields
      const headerY = M + 20;
      const fields = [
        { label: 'Date', value: header.date },
        { label: 'Driver Name', value: header.driverName },
        { label: 'Truck/Tractor No.', value: header.truckId },
        { label: 'Name of Carrier', value: header.carrier },
        { label: 'From', value: header.from },
        { label: 'To', value: header.to },
        { label: 'Total Miles Driving Today', value: String(header.totalMiles) },
        { label: 'Cycle Hours Used', value: `${header.cycleUsed}h` },
      ];

      const colW = cW / 4;
      fields.forEach((f, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = M + col * colW;
        const y = headerY + row * 12;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(...GRAY);
        pdf.text(f.label, x + 2, y + 3);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(...BLACK);
        pdf.text(f.value, x + 2, y + 8);

        // Box
        pdf.setDrawColor(...LIGHT_GRAY);
        pdf.setLineWidth(0.3);
        pdf.rect(x, y, colW, 11);
      });

      // 24-Hour Grid
      const gridY = headerY + 30;
      const gridH = 48; // 4 rows of 12mm
      const rowH = gridH / 4;
      const labelW = 35;
      const totalColW = 18;
      const chartW = cW - labelW - totalColW;
      const hourW = chartW / 24;

      // Grid border
      pdf.setDrawColor(...BLACK);
      pdf.setLineWidth(0.5);
      pdf.rect(M + labelW, gridY, chartW, gridH);

      // Hour labels
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.setTextColor(...BLACK);
      for (let i = 0; i <= 24; i++) {
        const x = M + labelW + i * hourW;
        const label = i === 0 ? 'Mid-\nnight' : i === 12 ? 'Noon' : i === 24 ? 'Mid-\nnight' : String(i);
        if (i === 0 || i === 24) {
          pdf.setFontSize(5);
          pdf.text('Mid-', x, gridY - 5, { align: 'center' });
          pdf.text('night', x, gridY - 2, { align: 'center' });
          pdf.setFontSize(6);
        } else {
          pdf.text(String(label), x, gridY - 2, { align: 'center' });
        }

        // Vertical line
        pdf.setDrawColor(i % 6 === 0 ? 0 : 180, i % 6 === 0 ? 0 : 180, i % 6 === 0 ? 0 : 180);
        pdf.setLineWidth(i % 6 === 0 ? 0.4 : 0.15);
        pdf.line(x, gridY, x, gridY + gridH);

        // 15-min ticks
        if (i < 24) {
          for (let q = 1; q <= 3; q++) {
            const qx = x + q * hourW / 4;
            pdf.setDrawColor(210, 210, 210);
            pdf.setLineWidth(0.1);
            pdf.line(qx, gridY, qx, gridY + 2);
          }
        }
      }

      // Row labels and horizontal lines
      const statusLabels = ['1. Off Duty', '2. Sleeper\n    Berth', '3. Driving', '4. On Duty\n    (Not Driving)'];
      STATUS_ORDER.forEach((_, rowIdx) => {
        const y = gridY + rowIdx * rowH;

        // Horizontal line
        pdf.setDrawColor(...BLACK);
        pdf.setLineWidth(0.3);
        pdf.line(M + labelW, y + rowH, M + labelW + chartW, y + rowH);

        // Label
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(...BLACK);
        const label = statusLabels[rowIdx];
        if (label.includes('\n')) {
          const parts = label.split('\n');
          pdf.text(parts[0], M + 2, y + rowH / 2);
          pdf.text(parts[1].trim(), M + 2, y + rowH / 2 + 4);
        } else {
          pdf.text(label, M + 2, y + rowH / 2 + 2);
        }

        // Row fill alternating
        if (rowIdx % 2 === 0) {
          pdf.setFillColor(248, 248, 248);
          pdf.rect(M + labelW, y, chartW, rowH, 'F');
          // Redraw borders
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.1);
          pdf.rect(M + labelW, y, chartW, rowH);
        }
      });

      // Draw duty status line on grid
      pdf.setDrawColor(...BLACK);
      pdf.setLineWidth(1.2);
      segments.forEach((seg, i) => {
        const x1 = M + labelW + seg.start * hourW;
        const x2 = M + labelW + seg.end * hourW;
        const rowIdx = STATUS_ORDER.indexOf(seg.status);
        const y = gridY + rowIdx * rowH + rowH / 2;

        // Vertical transition line
        if (i > 0) {
          const prevSeg = segments[i - 1];
          const prevRowIdx = STATUS_ORDER.indexOf(prevSeg.status);
          const prevY = gridY + prevRowIdx * rowH + rowH / 2;
          pdf.line(x1, prevY, x1, y);
        }
        // Horizontal line
        pdf.line(x1, y, x2, y);
      });

      // Total hours column
      const totalX = M + labelW + chartW;
      pdf.setDrawColor(...BLACK);
      pdf.setLineWidth(0.5);
      pdf.rect(totalX, gridY, totalColW, gridH);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(...BLACK);
      pdf.text('Total', totalX + totalColW / 2, gridY - 5, { align: 'center' });
      pdf.text('Hours', totalX + totalColW / 2, gridY - 2, { align: 'center' });

      STATUS_ORDER.forEach((status, rowIdx) => {
        const y = gridY + rowIdx * rowH + rowH / 2 + 2;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        const hrs = totals[status];
        pdf.text(hrs.toFixed(hrs % 1 === 0 ? 0 : 1), totalX + totalColW / 2, y, { align: 'center' });

        // Separator
        if (rowIdx < 3) {
          pdf.setDrawColor(...LIGHT_GRAY);
          pdf.setLineWidth(0.2);
          pdf.line(totalX, gridY + (rowIdx + 1) * rowH, totalX + totalColW, gridY + (rowIdx + 1) * rowH);
        }
      });

      // Remarks section
      const remarksY = gridY + gridH + 10;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...BLACK);
      pdf.text('Remarks:', M, remarksY);
      pdf.setDrawColor(...LIGHT_GRAY);
      pdf.setLineWidth(0.3);
      for (let i = 0; i < 3; i++) {
        pdf.line(M, remarksY + 5 + i * 6, M + cW, remarksY + 5 + i * 6);
      }

      // Recap section
      const recapY = remarksY + 28;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('Recap:', M, recapY);

      const recapLabels = [
        ['70 Hour / 8 Day', `${header.cycleUsed}h`],
        ['60 Hour / 7 Day', '-'],
        ['Available', `${Math.max(0, 70 - header.cycleUsed)}h`],
      ];
      recapLabels.forEach(([label, value], i) => {
        const x = M + 20 + i * 50;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(...GRAY);
        pdf.text(label, x, recapY);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(...BLACK);
        pdf.text(value, x, recapY + 5);
      });

      // Signature section
      const sigY = H - M - 15;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(...GRAY);
      pdf.text('Driver Signature:', M, sigY);
      pdf.setDrawColor(...BLACK);
      pdf.setLineWidth(0.4);
      pdf.line(M + 30, sigY, M + 100, sigY);

      pdf.text('Date:', M + 110, sigY);
      pdf.text(header.date, M + 120, sigY);

      pdf.text('Co-Driver:', M + 160, sigY);
      pdf.line(M + 180, sigY, M + 240, sigY);

      // Footer
      pdf.setFontSize(6);
      pdf.setTextColor(...GRAY);
      pdf.text(`Generated by TruckLog Pro — ${new Date().toISOString().split('T')[0]}`, W / 2, H - 5, { align: 'center' });

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
