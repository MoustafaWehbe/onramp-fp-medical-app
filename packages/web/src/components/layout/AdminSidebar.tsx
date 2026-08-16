import { NavLink } from "react-router-dom";
import {
  Building2,
  HeartPulse,
  LayoutDashboard,
  Pill,
  Stethoscope,
  Activity,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { BrandMark } from "./BrandMark";

const navSections = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: "Catalogs",
    items: [
      {
        to: "/admin/medications",
        label: "Medications",
        icon: Pill,
        end: false,
      },
      {
        to: "/admin/conditions",
        label: "Conditions",
        icon: HeartPulse,
        end: false,
      },
      {
        to: "/admin/symptoms",
        label: "Symptoms",
        icon: Activity,
        end: false,
      },
      {
        to: "/admin/clinics",
        label: "Clinics",
        icon: Building2,
        end: false,
      },
      {
        to: "/admin/doctors",
        label: "Doctors",
        icon: Stethoscope,
        end: false,
      },
    ],
  },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border/70 bg-card">
      <div className="flex h-16 items-center border-b border-border/70 px-5">
        <BrandMark />
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onNavigate}
                  end={end}
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
