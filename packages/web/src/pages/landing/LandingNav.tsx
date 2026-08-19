import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Languages, LogIn } from "lucide-react";
import { BrandMark } from "../../components/layout/BrandMark";
import { ThemeToggle } from "../../components/layout/ThemeToggle";
import { buttonVariants } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { prefersReducedMotion } from "../../lib/motion";
import { LANDING_SECTIONS, type LandingSectionId } from "./sections";
import { scrollToLandingSection } from "./scroll";

const NAV_LINKS = LANDING_SECTIONS.filter((section) => section.id !== "hero");

interface LandingNavProps {
  activeId: LandingSectionId;
}

export function LandingNav({ activeId }: LandingNavProps) {
  const { t, i18n } = useTranslation();
  const headerRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const header = headerRef.current;
      const progress = progressRef.current;
      if (!header || !progress) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const setProgress = () => {
          const ratio = document.documentElement.scrollHeight - window.innerHeight;
          gsap.set(progress, {
            scaleX: ratio > 0 ? window.scrollY / ratio : 0,
            transformOrigin: "left center",
          });
        };

        setProgress();
        window.addEventListener("scroll", setProgress, { passive: true });
        return () => window.removeEventListener("scroll", setProgress);
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });

        gsap.to(progress, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            start: 0,
            end: "max",
            scrub: 0.35,
          },
        });

        ScrollTrigger.create({
          start: 48,
          onEnter: () => header.setAttribute("data-scrolled", "true"),
          onLeaveBack: () => header.setAttribute("data-scrolled", "false"),
        });
      });

      return () => mm.revert();
    },
    { scope: headerRef },
  );

  useGSAP(
    () => {
      const links = linksRef.current;
      const indicator = indicatorRef.current;
      if (!links || !indicator) return;

      const move = (animate: boolean) => {
        const active = links.querySelector<HTMLElement>(`[data-nav-link="${activeId}"]`);
        if (!active) {
          gsap.to(indicator, {
            autoAlpha: 0,
            duration: prefersReducedMotion() || !animate ? 0 : 0.2,
            overwrite: "auto",
          });
          return;
        }

        const listBox = links.getBoundingClientRect();
        const activeBox = active.getBoundingClientRect();
        const vars = {
          autoAlpha: 1,
          x: activeBox.left - listBox.left,
          y: activeBox.top - listBox.top,
          width: activeBox.width,
          height: activeBox.height,
          ease: "power3.out",
          overwrite: "auto" as const,
        };

        if (!animate || !indicator.dataset.ready || prefersReducedMotion()) {
          gsap.set(indicator, vars);
          indicator.dataset.ready = "true";
          return;
        }

        gsap.to(indicator, { ...vars, duration: 0.35 });
      };

      move(true);
      const onResize = () => move(false);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { dependencies: [activeId], scope: headerRef },
  );

  return (
    <div className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <header
        ref={headerRef}
        data-scrolled="false"
        className="pointer-events-auto relative mx-auto flex max-w-6xl items-center gap-2 rounded-full border border-white/60 bg-card/70 py-1.5 pl-3 pr-1.5 shadow-lift backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 data-[scrolled=true]:border-primary/25 data-[scrolled=true]:bg-card/90 data-[scrolled=true]:shadow-glow dark:border-border/70 sm:gap-3 sm:pl-4 sm:pr-2"
      >
        <Link
          to="/"
          aria-label={t("landing.home")}
          className="shrink-0 rounded-full px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
              return;
            }
            event.preventDefault();
            scrollToLandingSection("hero");
          }}
        >
          <BrandMark compact className="sm:hidden" />
          <BrandMark className="hidden sm:flex" />
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center lg:flex"
          aria-label={t("landing.navigation")}
        >
          <div
            ref={linksRef}
            className="relative flex items-center gap-0.5 rounded-full bg-secondary/70 p-1"
          >
            <span
              ref={indicatorRef}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 rounded-full bg-card shadow-soft"
            />
            {NAV_LINKS.map((link) => {
              const active = link.id === activeId;
              const Icon = link.icon;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  data-nav-link={link.id}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "relative z-10 flex min-h-10 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToLandingSection(link.id);
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {t(link.label)}
                </a>
              );
            })}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full px-2")}
            aria-label={t(i18n.language === "ar" ? "landing.switchToEnglish" : "landing.switchToArabic")}
            title={t("landing.language")}
            onClick={() => {
              const language = i18n.language === "ar" ? "en" : "ar";
              void i18n.changeLanguage(language);
              localStorage.setItem("healthtracker-language", language);
            }}
          >
            <Languages className="mr-1 h-4 w-4" aria-hidden />
            {t(i18n.language === "ar" ? "landing.englishShort" : "landing.arabicShort")}
          </button>
          <ThemeToggle className="rounded-full" />
          <Link
            to="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden rounded-full sm:inline-flex",
            )}
          >
            <LogIn className="mr-1.5 h-4 w-4" aria-hidden />
            {t("landing.signIn")}
          </Link>
          <Link
            to="/register"
            className={cn(buttonVariants({ size: "sm" }), "rounded-full shadow-glow")}
          >
            {t("landing.getStarted")}
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
          </Link>
        </div>

        <span
          ref={progressRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-6 bottom-0 h-0.5 origin-left rounded-full bg-primary"
        />
      </header>
    </div>
  );
}
