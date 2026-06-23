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
      { to: "/log/new", label: "New Log", icon: ClipboardPlus },
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

export function Sidebar() {
  return (
    <aside className="flex w-60 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6">
        <span className="font-semibold">Starter Kit</span>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
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
