import { DutyStatus } from '@/types/trip';

const STATUS_LABELS: Record<string, string> = {
  OFF: 'Off Duty',
  SLEEPER: 'Sleeper Berth',
  DRIVING: 'Driving',
  ON: 'On Duty (Not Driving)'
};

const STATUS_ORDER: DutyStatus[] = ['OFF', 'SLEEPER', 'DRIVING', 'ON'];

interface TotalsProps {
  totals: Record<string, number>;
}

export const Totals = ({ totals }: TotalsProps) => {
  const formatHours = (value: number) => {
    return (value || 0).toFixed(1);
  };

  return (
    <div className="p-6 border-t border-border bg-card/20">
      <h4 className="text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em]">
        24-Hour Period Summary
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUS_ORDER.map((status) => {
          const value = totals[status] || 0;
          
          return (
            <div 
              key={status} 
              className="bg-secondary/30 rounded-lg p-4 border border-border/40 backdrop-blur-sm transition-all hover:bg-secondary/40"
            >
              <p className="text-[9px] text-muted-foreground mb-1 font-bold uppercase tracking-wider">
                {STATUS_LABELS[status]}
              </p>
              
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-foreground tracking-tight">
                  {formatHours(value)}
                </p>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">
                  hrs
                </span>
              </div>

              {/* Barre de progression basée sur 24h */}
              <div className="mt-2 h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary/60" 
                  style={{ width: `${Math.min((value / 24) * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};