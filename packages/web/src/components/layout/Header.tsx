import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t , i18n} = useTranslation();
  const today = new Intl.DateTimeFormat(
    i18n.language === "ar" ? "ar-LB" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-card px-3 sm:px-5 md:px-8">
      <button
        onClick={onMenuClick}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        aria-label={t("common.openNavigation")}
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      <BrandMark className="md:hidden" />
      <p className="hidden text-sm font-medium text-muted-foreground lg:block">{today}</p>
      <div className="ms-auto hidden min-w-0 items-center gap-3 sm:flex">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 leading-tight">
          <p className="max-w-40 truncate text-sm font-semibold">{user?.name}</p>
          <p className="text-xs capitalize text-muted-foreground">{user?.role}</p>
        </div>
      </div>

      <ThemeToggle />

      <button
        onClick={logout}
        className="flex h-11 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{t("common.logout")}</span>
      </button>
    </header>
  );
}
