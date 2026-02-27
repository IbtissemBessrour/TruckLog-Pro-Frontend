import { LogHeader } from '@/types/trip';

export const Header = ({ header }: { header: LogHeader }) => (
  <div className="p-6 border-b border-border bg-card/50">
    <div className="text-center mb-6">
      <h3 className="text-lg font-bold text-foreground tracking-wide uppercase">Driver's Daily Log</h3>
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
        U.S. Department of Transportation — Federal Motor Carrier Safety Administration
      </p>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
      {/* Mappage dynamique des données JSON */}
      <Field label="Date" value={header.date} />
      <Field label="Driver Name" value={header.driverName} />
      <Field label="Truck ID" value={header.truckId} />
      <Field label="Carrier" value={header.carrier} />
      <Field label="From" value={header.from} />
      <Field label="To" value={header.to} />
      <Field label="Total Miles" value={`${header.totalMiles} mi`} />
      <Field label="Cycle Used" value={`${header.cycleUsed}h`} />
    </div>
  </div>
);

const Field = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[10px] text-muted-foreground mb-0.5 uppercase font-bold tracking-tighter">
      {label}
    </p>
    <p className="text-sm font-semibold text-foreground border-b border-border/50 pb-1 truncate">
      {value || "—"}
    </p>
  </div>
);