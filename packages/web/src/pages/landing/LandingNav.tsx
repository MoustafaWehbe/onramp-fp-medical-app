import { Link } from "react-router-dom";
import { BrandMark } from "../../components/layout/BrandMark";
import { ThemeToggle } from "../../components/layout/ThemeToggle";
import { buttonVariants } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { LANDING_SECTIONS, type LandingSectionId } from "./sections";
import { scrollToLandingSection } from "./scroll";

const NAV_LINKS = LANDING_SECTIONS.filter((section) => section.id !== "hero");

interface LandingNavProps {
  activeId: LandingSectionId;
}

export function LandingNav({ activeId }: LandingNavProps) {
  return (
    <div className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <header className="pointer-events-auto mx-auto flex max-w-6xl items-center gap-2 rounded-full border border-white/60 bg-card/70 py-1.5 pl-3 pr-1.5 shadow-lift backdrop-blur-xl dark:border-border/70 sm:gap-3 sm:pl-4 sm:pr-2">
        <Link
          to="/"
          aria-label="HealthTrack home"
          className="shrink-0 rounded-full px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandMark compact className="sm:hidden" />
          <BrandMark className="hidden sm:flex" />
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center lg:flex"
          aria-label="Landing"
        >
          <div className="flex items-center gap-0.5 rounded-full bg-secondary/70 p-1">
            {NAV_LINKS.map((link) => {
              const active = link.id === activeId;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToLandingSection(link.id);
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle className="rounded-full" />
          <Link
            to="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden rounded-full sm:inline-flex",
            )}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className={cn(buttonVariants({ size: "sm" }), "rounded-full shadow-glow")}
          >
            Get started
          </Link>
        </div>
      </header>
    </div>
  );
}
