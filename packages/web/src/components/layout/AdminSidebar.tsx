import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
import i18n from "@/i18n";

const navSections = [
  {
    label: "navigation.admin.overview",
    items: [
      {
        to: "/admin",
        label: "navigation.admin.dashboard",
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    label: "navigation.admin.catalogs",
    items: [
      {
        to: "/admin/medications",
        label: "navigation.admin.medications",
        icon: Pill,
        end: false,
      },
      {
        to: "/admin/conditions",
        label: "navigation.admin.conditions",
        icon: HeartPulse,
        end: false,
      },
      {
        to: "/admin/symptoms",
        label: "navigation.admin.symptoms",
        icon: Activity,
        end: false,
      },
      {
        to: "/admin/clinics",
        label: "navigation.admin.clinics",
        icon: Building2,
        end: false,
      },
      {
        to: "/admin/doctors",
        label: "navigation.admin.doctors",
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
  const { t } = useTranslation();
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const items = rootRef.current?.querySelectorAll(".nav-item");
      if (!items?.length) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(items, { opacity: 1, x: 0 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const isArabic = i18n.language === "ar";
        gsap.fromTo(
          items,
          { opacity: 0, x: isArabic ? 10 : -10 },
          { opacity: 1, x: 0, duration: 0.32, stagger: 0.035, ease: "power2.out" },
        );
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <aside
      ref={rootRef}
      className="flex h-full w-64 shrink-0 flex-col border-s border-border/60 bg-card"
    >
      <div className="flex h-16 items-center border-b border-border/60 px-5">
        <BrandMark />
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label={t("navigation.admin.navigation")}>
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
              {t(section.label)}
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
                      "nav-item flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-[color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                    )
                  }
                >
                  <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
                  {t(label)}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <p className="border-t border-border/60 px-5 py-4 text-xs text-muted-foreground">
        {t("navigation.admin.sharedCatalogs")}
      </p>
    </aside>
  );
}
