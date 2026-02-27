export const Signature = ({ name, date }: { name: string; date: string }) => (
  <div className="p-6 border-t border-border flex flex-col md:flex-row justify-between items-end gap-6 bg-card/30">
    <div className="w-full md:w-auto">
      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
        Driver Signature
      </p>
      <div className="border-b-2 border-primary/20 w-full md:w-72 h-12 flex items-center font-serif italic text-2xl text-primary/80 px-2">
        {name || "Waiting for signature..."}
      </div>
      <p className="text-[9px] text-muted-foreground/50 mt-1 uppercase">
        I certify these entries are true and correct
      </p>
    </div>
    
    <div className="text-right w-full md:w-auto">
      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">
        Verification Date
      </p>
      <p className="inline-block text-sm font-mono font-bold bg-secondary/50 px-4 py-1.5 rounded border border-border/50 text-foreground">
        {date || "—"}
      </p>
    </div>
  </div>
);