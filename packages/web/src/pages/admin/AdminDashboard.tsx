import { Link } from "react-router-dom";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Activity,
  Building2,
  HeartPulse,
  LayoutDashboard,
  Pill,
  Stethoscope,
} from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";

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
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gridRef.current?.querySelectorAll(".catalog-card");
      if (!cards?.length) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(cards, { opacity: 1, y: 0 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.38, stagger: 0.07, ease: "power2.out" },
        );
      });

      return () => mm.revert();
    },
    { scope: gridRef },
  );

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Administration"
        title="Catalog admin"
        description="Manage the shared reference data used across patient profiles and daily entries."
        icon={LayoutDashboard}
      />

      <div ref={gridRef} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {catalogs.map(({ to, title, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="catalog-card group rounded-2xl border border-border/80 bg-card/90 p-5 shadow-soft backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
