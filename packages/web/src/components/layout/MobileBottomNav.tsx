import { Activity, ClipboardPlus, HeartPulse, LayoutDashboard, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

interface MobileBottomNavProps {
  onMoreClick: () => void;
}

const items = [
  {
    to: "/dashboard",
    label: "navigation.mobile.home",
    icon: LayoutDashboard,
  },
  {
    to: "/log/view",
    label: "navigation.mobile.log",
    icon: ClipboardPlus,
  },
  {
    to: "/health-profile",
    label: "navigation.mobile.health",
    icon: HeartPulse,
  },
  {
    to: "/analytics",
    label: "navigation.mobile.insights",
    icon: Activity,
  },
];

export function MobileBottomNav({ onMoreClick }: MobileBottomNavProps) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("navigation.mobile.navigation")}
      className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[1.4rem] border border-white/50 bg-card p-1.5 shadow-lift dark:border-border/60 md:hidden print:hidden"
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.6875rem] font-semibold transition-[color,background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )
          }
        >
          <Icon className="h-5 w-5" aria-hidden />
          {t(label)}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onMoreClick}
        className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.6875rem] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t("navigation.mobile.navigation")}
      >
        <Menu className="h-5 w-5" aria-hidden />
        {t("navigation.mobile.openAll")}
      </button>
    </nav>
  );
}
