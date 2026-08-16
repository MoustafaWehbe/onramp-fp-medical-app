import { Activity, ClipboardPlus, HeartPulse, LayoutDashboard, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

interface MobileBottomNavProps {
  onMoreClick: () => void;
}

const items = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/log/view", label: "Log", icon: ClipboardPlus },
  { to: "/health-profile", label: "Health", icon: HeartPulse },
  { to: "/analytics", label: "Insights", icon: Activity },
];

export function MobileBottomNav({ onMoreClick }: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-white/50 bg-card/95 p-1.5 shadow-lift backdrop-blur-xl dark:border-border/70 md:hidden"
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.6875rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )
          }
        >
          <Icon className="h-5 w-5" aria-hidden />
          {label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onMoreClick}
        className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.6875rem] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open all navigation"
      >
        <Menu className="h-5 w-5" aria-hidden />
        More
      </button>
    </nav>
  );
}
