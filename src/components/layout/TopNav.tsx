import { Bell, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const TopNav = ({ title }: { title: string }) => (
  <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
    <h1 className="text-lg font-semibold text-foreground">{title}</h1>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          placeholder="Search..."
          className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground w-40"
        />
      </div>
      <ThemeToggle />
      <button className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
      </button>
      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
        <span className="text-xs font-semibold text-primary">JD</span>
      </div>
    </div>
  </header>
);

export default TopNav;
