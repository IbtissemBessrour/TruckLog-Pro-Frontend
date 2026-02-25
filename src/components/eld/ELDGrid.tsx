import { LogSegment, DutyStatus } from '@/types/trip';

const STATUS_LABELS: Record<DutyStatus, string> = {
  OFF: 'Off Duty',
  SLEEPER: 'Sleeper Berth',
  DRIVING: 'Driving',
  ON: 'On Duty (Not Driving)',
};

const STATUS_ORDER: DutyStatus[] = ['OFF', 'SLEEPER', 'DRIVING', 'ON'];
const HOUR_WIDTH = 36;
const ROW_HEIGHT = 32;
const LEFT_MARGIN = 120;
const RIGHT_MARGIN = 60;
const TOP_MARGIN = 30;
const TOTAL_WIDTH = LEFT_MARGIN + 24 * HOUR_WIDTH + RIGHT_MARGIN;
const TOTAL_HEIGHT = TOP_MARGIN + 4 * ROW_HEIGHT + 30;

const statusToY = (status: DutyStatus) => {
  const idx = STATUS_ORDER.indexOf(status);
  return TOP_MARGIN + idx * ROW_HEIGHT + ROW_HEIGHT / 2;
};

const ELDGrid = ({ segments }: { segments: LogSegment[] }) => {
  // Calculate totals
  const totals: Record<DutyStatus, number> = { OFF: 0, SLEEPER: 0, DRIVING: 0, ON: 0 };
  segments.forEach(s => { totals[s.status] += s.end - s.start; });

  // Build path
  const pathParts: string[] = [];
  segments.forEach((seg, i) => {
    const x1 = LEFT_MARGIN + seg.start * HOUR_WIDTH;
    const x2 = LEFT_MARGIN + seg.end * HOUR_WIDTH;
    const y = statusToY(seg.status);

    if (i === 0) {
      pathParts.push(`M ${x1} ${y}`);
    } else {
      pathParts.push(`L ${x1} ${y}`);
    }
    pathParts.push(`L ${x2} ${y}`);
  });

  return (
    <svg viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`} className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Background */}
      <rect width={TOTAL_WIDTH} height={TOTAL_HEIGHT} fill="transparent" />

      {/* Hour labels top */}
      {Array.from({ length: 25 }, (_, i) => (
        <text
          key={`h-${i}`}
          x={LEFT_MARGIN + i * HOUR_WIDTH}
          y={TOP_MARGIN - 8}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="9"
          fontWeight="500"
        >
          {i === 0 ? 'Mid' : i === 12 ? 'Noon' : i}
        </text>
      ))}

      {/* Grid rows */}
      {STATUS_ORDER.map((status, rowIdx) => {
        const y = TOP_MARGIN + rowIdx * ROW_HEIGHT;
        return (
          <g key={status}>
            {/* Row background */}
            <rect
              x={LEFT_MARGIN}
              y={y}
              width={24 * HOUR_WIDTH}
              height={ROW_HEIGHT}
              className={rowIdx % 2 === 0 ? 'fill-muted/50' : 'fill-transparent'}
            />
            {/* Label */}
            <text
              x={LEFT_MARGIN - 10}
              y={y + ROW_HEIGHT / 2 + 4}
              textAnchor="end"
              className="fill-foreground"
              fontSize="9"
              fontWeight="500"
            >
              {STATUS_LABELS[status]}
            </text>
            {/* Horizontal line */}
            <line
              x1={LEFT_MARGIN}
              y1={y + ROW_HEIGHT}
              x2={LEFT_MARGIN + 24 * HOUR_WIDTH}
              y2={y + ROW_HEIGHT}
              className="stroke-border"
              strokeWidth="0.5"
            />
            {/* Total hours */}
            <text
              x={LEFT_MARGIN + 24 * HOUR_WIDTH + 10}
              y={y + ROW_HEIGHT / 2 + 4}
              className="fill-foreground"
              fontSize="11"
              fontWeight="700"
            >
              {totals[status].toFixed(totals[status] % 1 === 0 ? 0 : 1)}
            </text>
          </g>
        );
      })}

      {/* Vertical hour lines */}
      {Array.from({ length: 25 }, (_, i) => (
        <line
          key={`vl-${i}`}
          x1={LEFT_MARGIN + i * HOUR_WIDTH}
          y1={TOP_MARGIN}
          x2={LEFT_MARGIN + i * HOUR_WIDTH}
          y2={TOP_MARGIN + 4 * ROW_HEIGHT}
          className="stroke-border"
          strokeWidth={i % 6 === 0 ? '1' : '0.3'}
        />
      ))}

      {/* Quarter-hour ticks */}
      {Array.from({ length: 96 }, (_, i) => {
        const x = LEFT_MARGIN + (i / 4) * HOUR_WIDTH;
        if (i % 4 === 0) return null;
        return (
          <line
            key={`tick-${i}`}
            x1={x}
            y1={TOP_MARGIN}
            x2={x}
            y2={TOP_MARGIN + 4}
            className="stroke-muted-foreground/30"
            strokeWidth="0.3"
          />
        );
      })}

      {/* Duty status line */}
      <path
        d={pathParts.join(' ')}
        fill="none"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Border */}
      <rect
        x={LEFT_MARGIN}
        y={TOP_MARGIN}
        width={24 * HOUR_WIDTH}
        height={4 * ROW_HEIGHT}
        fill="none"
        className="stroke-border"
        strokeWidth="1"
      />

      {/* Total label */}
      <text
        x={LEFT_MARGIN + 24 * HOUR_WIDTH + 10}
        y={TOP_MARGIN - 8}
        className="fill-muted-foreground"
        fontSize="8"
        fontWeight="600"
      >
        TOTAL
      </text>
      <text
        x={LEFT_MARGIN + 24 * HOUR_WIDTH + 10}
        y={TOP_MARGIN - 0}
        className="fill-muted-foreground"
        fontSize="8"
        fontWeight="600"
      >
        HOURS
      </text>
    </svg>
  );
};

export default ELDGrid;
