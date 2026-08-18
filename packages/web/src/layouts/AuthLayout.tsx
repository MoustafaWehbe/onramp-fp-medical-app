import { useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { BrandMark } from "../components/layout/BrandMark";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { AmbientBackground } from "../components/motion/AmbientBackground";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";
import { prefersReducedMotion } from "../lib/motion";
import { LANDING_IMAGES } from "../pages/landing/images";

const COPY = {
  login: {
    eyebrow: "Welcome back",
    title: "Pick up the log you already started.",
    body: "Sign in to record the day and keep your record ready for care. Your logs stay in your account.",
  },
  register: {
    eyebrow: "Get started",
    title: "Start a log you can bring to a visit.",
    body: "Create an account for mood, sleep, medications, and visits—in one calm place.",
  },
} as const;

export function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.startsWith("/register");
  const copy = isRegister ? COPY.register : COPY.login;

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const enteredRef = useRef(false);

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(panel, { autoAlpha: 1, y: 0, scale: 1 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          panel,
          { autoAlpha: 0, y: 28, scale: 0.985 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" },
        );
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      const tabs = tabsRef.current;
      const indicator = indicatorRef.current;
      const form = formRef.current;
      const copyNode = copyRef.current;
      const loginPhoto = rootRef.current?.querySelector<HTMLElement>('[data-auth-photo="login"]');
      const registerPhoto = rootRef.current?.querySelector<HTMLElement>(
        '[data-auth-photo="register"]',
      );
      if (!tabs || !indicator || !form) return;

      const active = tabs.querySelector<HTMLElement>(
        `[data-auth-tab="${isRegister ? "register" : "login"}"]`,
      );

      const moveIndicator = (animate: boolean) => {
        if (!active) return;
        const tabBox = tabs.getBoundingClientRect();
        const activeBox = active.getBoundingClientRect();
        const vars = {
          autoAlpha: 1,
          x: activeBox.left - tabBox.left,
          y: activeBox.top - tabBox.top,
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

      const firstVisit = !enteredRef.current;
      enteredRef.current = true;
      const reduced = prefersReducedMotion();

      if (loginPhoto && registerPhoto) {
        gsap.to(loginPhoto, {
          autoAlpha: isRegister ? 0 : 1,
          scale: isRegister ? 1.06 : 1,
          duration: reduced ? 0 : firstVisit ? 0.7 : 0.45,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(registerPhoto, {
          autoAlpha: isRegister ? 1 : 0,
          scale: isRegister ? 1 : 1.06,
          duration: reduced ? 0 : firstVisit ? 0.7 : 0.45,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      if (reduced) {
        gsap.set(form, { autoAlpha: 1, x: 0, y: 0 });
        if (copyNode) gsap.set(copyNode, { autoAlpha: 1, y: 0 });
      } else if (firstVisit) {
        gsap.fromTo(
          form,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.45, delay: 0.08, ease: "power3.out" },
        );
        if (copyNode) {
          gsap.fromTo(
            copyNode,
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.12, ease: "power3.out" },
          );
        }
      } else {
        const fromX = isRegister ? 40 : -40;
        gsap.fromTo(
          form,
          { autoAlpha: 0, x: fromX },
          { autoAlpha: 1, x: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" },
        );
        if (copyNode) {
          gsap.fromTo(
            copyNode,
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" },
          );
        }
      }

      moveIndicator(!firstVisit && !reduced);

      const onResize = () => moveIndicator(false);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { dependencies: [isRegister], revertOnUpdate: false, scope: rootRef },
  );

  return (
    <div ref={rootRef} className="app-canvas relative min-h-dvh overflow-x-clip">
      <AmbientBackground />

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-4 sm:px-6">
        <header className="flex items-center justify-between gap-2">
          <Link
            to="/"
            aria-label="Back to website"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full px-3",
            )}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to website</span>
          </Link>
          <Link
            to="/"
            aria-label="HealthTrack home"
            className="rounded-full px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandMark compact className="sm:hidden" />
            <BrandMark className="hidden sm:flex" />
          </Link>
          <ThemeToggle className="rounded-full" />
        </header>

        <div className="my-auto grid items-stretch gap-6 py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
          <aside className="relative min-h-[14rem] overflow-hidden rounded-[2rem] border border-primary/15 shadow-lift sm:min-h-[18rem] lg:min-h-[38rem]">
            <img
              data-auth-photo="login"
              src={LANDING_IMAGES.clinician}
              alt=""
              width={1200}
              height={800}
              decoding="async"
              className="absolute inset-0 h-full w-full origin-center object-cover"
            />
            <img
              data-auth-photo="register"
              src={LANDING_IMAGES.wellness}
              alt=""
              width={1600}
              height={900}
              decoding="async"
              className="absolute inset-0 h-full w-full origin-center object-cover opacity-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/70 to-background/20 lg:bg-gradient-to-r lg:from-background/90 lg:via-background/55 lg:to-background/15" />
            <div ref={copyRef} className="relative flex h-full flex-col justify-end p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                {copy.eyebrow}
              </p>
              <p className="mt-3 max-w-md font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {copy.title}
              </p>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                {copy.body}
              </p>
            </div>
          </aside>

          <section
            ref={panelRef}
            className="flex flex-col justify-center rounded-[2rem] border border-white/60 bg-card/90 p-5 shadow-lift backdrop-blur-xl dark:border-border/80 sm:p-8"
          >
            <nav
              ref={tabsRef}
              className="relative mx-auto flex w-full max-w-sm items-center rounded-full bg-secondary/70 p-1"
              aria-label="Account"
            >
              <span
                ref={indicatorRef}
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 rounded-full bg-card opacity-0 shadow-soft"
              />
              <Link
                to="/login"
                data-auth-tab="login"
                aria-current={!isRegister ? "page" : undefined}
                className={cn(
                  "relative z-10 flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isRegister ? "text-muted-foreground hover:text-foreground" : "text-foreground",
                )}
              >
                <LogIn className="h-4 w-4" aria-hidden />
                Sign in
              </Link>
              <Link
                to="/register"
                data-auth-tab="register"
                aria-current={isRegister ? "page" : undefined}
                className={cn(
                  "relative z-10 flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isRegister ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <UserPlus className="h-4 w-4" aria-hidden />
                Get started
              </Link>
            </nav>

            <div className="overflow-hidden">
              <div ref={formRef} className="pt-6">
                <Outlet />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
