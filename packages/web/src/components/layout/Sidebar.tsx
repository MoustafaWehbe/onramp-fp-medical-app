import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardPlus,
  HeartPulse,
  Pill,
  Stethoscope,
  CalendarDays,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { BrandMark } from "./BrandMark";

const navSections = [
  {
    label: "Main",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Daily Log",
    items: [
      { to: "/log/view", label: "View Log", icon: ClipboardPlus },
    ],
  },
  {
    label: "Health",
    items: [
      { to: "/health-profile", label: "Health Profile", icon: HeartPulse },
      { to: "/medications", label: "Medications", icon: Pill },
      { to: "/providers", label: "Providers", icon: Stethoscope },
    ],
  },
  {
    label: "History",
    items: [
      { to: "/visits", label: "Doctor Visits", icon: CalendarDays },
    ],
  },
  {
    label: "Insights",
    items: [
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/ai-reports", label: "AI Reports", icon: FileText },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border/70 bg-card">
      <div className="flex h-16 items-center border-b border-border/70 px-5">
        <BrandMark />
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Primary navigation">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onNavigate}
                  end
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-[color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                    )
                  }
                >
                  <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
