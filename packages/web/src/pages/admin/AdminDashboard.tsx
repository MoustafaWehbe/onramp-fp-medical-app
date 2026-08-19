import { Link } from "react-router-dom";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
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
    key: "medications",
    icon: Pill,
  },
  {
    to: "/admin/conditions",
    key: "conditions",
    icon: HeartPulse,
  },
  {
    to: "/admin/symptoms",
    key: "symptoms",
    icon: Activity,
  },
  {
    to: "/admin/clinics",
    key: "clinics",
    icon: Building2,
  },
  {
    to: "/admin/doctors",
    key: "doctors",
    icon: Stethoscope,
  },
];

export function AdminDashboard() {
  const { t } = useTranslation();
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
        eyebrow={t("admin.dashboardEyebrow")}
        title={t("admin.dashboardTitle")}
        description={t("admin.dashboardDescription")}
        icon={LayoutDashboard}
      />

      <div ref={gridRef} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {catalogs.map(({ to, key, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="catalog-card group rounded-2xl border border-border/80 bg-card/90 p-5 shadow-soft backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold">{t(`admin.catalogs.${key}.title`)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t(`admin.catalogs.${key}.description`)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
