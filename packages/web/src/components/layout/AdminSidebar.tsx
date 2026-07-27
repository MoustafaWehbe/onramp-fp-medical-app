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

export function AdminSidebar() {
  return (
    <aside className="flex w-60 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6">
        <span className="font-semibold">Admin</span>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
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
