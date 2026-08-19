import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn, UserPlus } from "lucide-react";
import { BrandMark } from "../../../components/layout/BrandMark";
import { LANDING_SECTIONS } from "../sections";
import { scrollToLandingSection } from "../scroll";

export function LandingFooter() {
  const { t } = useTranslation();
  return (
    <footer className="mt-4 border-t border-border/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-3 md:gap-10 md:py-9">
        <div>
          <Link
            to="/"
            aria-label={t("landing.home")}
            className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandMark />
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            {t("landing.footerDescription")}
          </p>
        </div>

        <nav aria-label={t("landing.product")}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{t("landing.product")}</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
            {LANDING_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex min-h-10 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToLandingSection(section.id);
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {t(section.label)}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav aria-label={t("landing.account")}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{t("landing.account")}</p>
          <ul className="mt-3 space-y-1">
            <li>
              <Link
                to="/login"
                className="flex min-h-10 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogIn className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                {t("landing.signIn")}
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="flex min-h-10 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <UserPlus className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                {t("landing.createAccount")}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border/60">
        <p className="mx-auto max-w-7xl px-4 py-3 text-xs text-muted-foreground sm:px-6">
          {t("landing.copyright")}
        </p>
      </div>
    </footer>
  );
}
