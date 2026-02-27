import jsPDF from 'jspdf';
import { LogSegment, DutyStatus, LogHeader } from '@/types/trip';

const STATUS_ORDER: DutyStatus[] = ['OFF', 'SLEEPER', 'DRIVING', 'ON'];

/**
 * Service d'exportation PDF pour les logs ELD
 * Génère un document conforme aux normes FMCSA avec un nom de fichier attractif
 */
export const generateELDVipPDF = (
  header: LogHeader,
  segments: LogSegment[],
  totals: Record<DutyStatus, number>
) => {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297;
  const H = 210;
  const M = 15; // Marges
  const cW = W - 2 * M; // Largeur utile

  // Couleurs standards ELD
  const BLACK: [number, number, number] = [0, 0, 0];
  const GRAY: [number, number, number] = [120, 120, 120];
  const LIGHT_GRAY: [number, number, number] = [200, 200, 200];

  // --- TITRE ET ENTÊTE LÉGALE ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(...BLACK);
  pdf.text("DRIVER'S DAILY LOG", W / 2, M + 5, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...GRAY);
  pdf.text('(24 Hours) — U.S. Department of Transportation — Federal Motor Carrier Safety Administration', W / 2, M + 10, { align: 'center' });
  pdf.text('Original — File at home terminal. Duplicate — Driver retains in his/her possession for 8 days.', W / 2, M + 14, { align: 'center' });

  // --- CHAMPS D'ENTÊTE ---
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

    pdf.setFontSize(7);
    pdf.setTextColor(...GRAY);
    pdf.text(f.label, x + 2, y + 3);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...BLACK);
    pdf.text(String(f.value), x + 2, y + 8);

    pdf.setDrawColor(...LIGHT_GRAY);
    pdf.setLineWidth(0.3);
    pdf.rect(x, y, colW, 11);
  });

  // --- GRILLE DES 24 HEURES ---
  const gridY = headerY + 30;
  const gridH = 48; 
  const rowH = gridH / 4;
  const labelW = 35;
  const totalColW = 18;
  const chartW = cW - labelW - totalColW;
  const hourW = chartW / 24;

  pdf.setDrawColor(...BLACK);
  pdf.setLineWidth(0.5);
  pdf.rect(M + labelW, gridY, chartW, gridH);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
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

    pdf.setDrawColor(i % 6 === 0 ? 0 : 180);
    pdf.setLineWidth(i % 6 === 0 ? 0.4 : 0.15);
    pdf.line(x, gridY, x, gridY + gridH);

    if (i < 24) {
      for (let q = 1; q <= 3; q++) {
        const qx = x + q * hourW / 4;
        pdf.setDrawColor(210, 210, 210);
        pdf.setLineWidth(0.1);
        pdf.line(qx, gridY, qx, gridY + 2);
      }
    }
  }

  const statusLabels = ['1. Off Duty', '2. Sleeper\n    Berth', '3. Driving', '4. On Duty\n    (Not Driving)'];
  STATUS_ORDER.forEach((_, idx) => {
    const y = gridY + idx * rowH;
    pdf.setDrawColor(...BLACK);
    pdf.setLineWidth(0.3);
    pdf.line(M + labelW, y + rowH, M + labelW + chartW, y + rowH);

    pdf.setFontSize(7);
    const label = statusLabels[idx];
    if (label.includes('\n')) {
      const parts = label.split('\n');
      pdf.text(parts[0], M + 2, y + rowH / 2);
      pdf.text(parts[1].trim(), M + 2, y + rowH / 2 + 4);
    } else {
      pdf.text(label, M + 2, y + rowH / 2 + 2);
    }

    if (idx % 2 === 0) {
      pdf.setFillColor(248, 248, 248);
      pdf.rect(M + labelW, y, chartW, rowH, 'F');
    }
  });

  // --- TRACÉ DE LA LIGNE DE STATUT ---
  pdf.setDrawColor(...BLACK);
  pdf.setLineWidth(1.2);
  segments.forEach((seg, i) => {
    const x1 = M + labelW + seg.start * hourW;
    const x2 = M + labelW + seg.end * hourW;
    const rowIdx = STATUS_ORDER.indexOf(seg.status);
    const y = gridY + rowIdx * rowH + rowH / 2;

    if (i > 0) {
      const prevRowIdx = STATUS_ORDER.indexOf(segments[i - 1].status);
      const prevY = gridY + prevRowIdx * rowH + rowH / 2;
      pdf.line(x1, prevY, x1, y);
    }
    pdf.line(x1, y, x2, y);
  });

  // --- COLONNE DES TOTAUX ---
  const totalX = M + labelW + chartW;
  pdf.setLineWidth(0.5);
  pdf.rect(totalX, gridY, totalColW, gridH);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total', totalX + totalColW / 2, gridY - 5, { align: 'center' });
  pdf.text('Hours', totalX + totalColW / 2, gridY - 2, { align: 'center' });

  STATUS_ORDER.forEach((status, idx) => {
    const y = gridY + idx * rowH + rowH / 2 + 2;
    const hrs = totals[status] || 0;
    pdf.setFontSize(10);
    pdf.text(hrs.toFixed(hrs % 1 === 0 ? 0 : 1), totalX + totalColW / 2, y, { align: 'center' });
  });

  // --- SECTION SIGNATURE ---
  const sigY = H - M - 15;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...GRAY);
  pdf.text('Driver Signature:', M, sigY);
  pdf.setDrawColor(...BLACK);
  pdf.line(M + 30, sigY, M + 100, sigY);
  
  pdf.setFont('times', 'italic');
  pdf.setFontSize(10);
  pdf.setTextColor(...BLACK);
  pdf.text(header.driverName, M + 35, sigY - 2);

  // Bas de page
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(...GRAY);
  pdf.text(`Official Document — TruckLog Pro ELD Compliance System`, W / 2, H - 5, { align: 'center' });

  // --- NOM DE FICHIER ATTRACTIF ---
  // Format: Official-Log_2026-02-27_John-Doe.pdf
  const cleanName = header.driverName.trim().replace(/\s+/g, '-');
  const fileName = `Official-ELD-Log_${header.date}_${cleanName}.pdf`;

  // Téléchargement
  pdf.save(fileName);
};