import { Link } from "react-router-dom";
import {
  Activity,
  Building2,
  HeartPulse,
  Pill,
  Stethoscope,
} from "lucide-react";

const catalogs = [
  {
    to: "/admin/medications",
    title: "Medications",
    description: "Shared medication names, strength, and category.",
    icon: Pill,
  },
  {
    to: "/admin/conditions",
    title: "Conditions",
    description: "Standard condition names for patient profiles.",
    icon: HeartPulse,
  },
  {
    to: "/admin/symptoms",
    title: "Symptoms",
    description: "Symptom catalog used for tracking and autocomplete.",
    icon: Activity,
  },
  {
    to: "/admin/clinics",
    title: "Clinics",
    description: "Clinic directory patients can link to their providers.",
    icon: Building2,
  },
  {
    to: "/admin/doctors",
    title: "Doctors",
    description: "Doctor directory with specialty and contact info.",
    icon: Stethoscope,
  },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Catalog admin</h1>
        <p className="text-sm text-muted-foreground">
          Manage shared reference data. Patient profiles and daily entries stay
          on the user app.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {catalogs.map(({ to, title, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="rounded-lg border bg-card p-5 transition-colors hover:bg-accent/40"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
