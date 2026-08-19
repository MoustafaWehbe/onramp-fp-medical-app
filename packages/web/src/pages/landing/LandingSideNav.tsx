import { useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "../../lib/utils";
import { prefersReducedMotion } from "../../lib/motion";
import { LANDING_SECTIONS, type LandingSectionId } from "./sections";
import { scrollToLandingSection } from "./scroll";

interface LandingSideNavProps {
  activeId: LandingSectionId;
}

export function LandingSideNav({ activeId }: LandingSideNavProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const syncIndicatorRef = useRef(() => {});
  const pointerInsideRef = useRef(false);
  const activeLabel = t(LANDING_SECTIONS.find((section) => section.id === activeId)?.label ?? "landing.overview");

  useGSAP(
    () => {
      const list = listRef.current;
      const indicator = indicatorRef.current;
      const active = list?.querySelector<HTMLElement>(`[data-section="${activeId}"]`);
      if (!list || !indicator || !active) return;

      const move = () => {
        const icon = active.querySelector<HTMLElement>("[data-section-icon]");
        const listBox = list.getBoundingClientRect();
        const iconBox = (icon ?? active).getBoundingClientRect();
        const vars = {
          x: iconBox.left - listBox.left,
          y: iconBox.top - listBox.top,
          width: iconBox.width,
          height: iconBox.height,
          ease: "power3.out",
          overwrite: "auto" as const,
        };

        if (!indicator.dataset.ready || prefersReducedMotion()) {
          gsap.set(indicator, vars);
          indicator.dataset.ready = "true";
          return;
        }

        gsap.to(indicator, { ...vars, duration: 0.3 });
      };

      syncIndicatorRef.current = move;
      move();
      window.addEventListener("resize", move);
      return () => window.removeEventListener("resize", move);
    },
    { dependencies: [activeId], scope: rootRef },
  );

  useGSAP(
    (_context, contextSafe) => {
      const panel = panelRef.current;
      const list = listRef.current;
      if (!panel || !list || !contextSafe) return;

      const labels = gsap.utils.toArray<HTMLElement>("[data-section-label]", list);
      const mm = gsap.matchMedia();
      const duration = () => (prefersReducedMotion() ? 0 : 0.32);

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(list, { autoAlpha: 1, x: 0, y: 0 });
      });

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          list,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.45, delay: 0.3, ease: "power3.out" },
        );
      });

      mm.add("(min-width: 768px)", () => {
        gsap.set(labels, { autoAlpha: 0, width: 0, marginRight: 0, overflow: "hidden" });
        gsap.set(list, { autoAlpha: 1, x: 0 });

        if (!prefersReducedMotion()) {
          gsap.fromTo(
            list,
            { autoAlpha: 0, x: 24 },
            { autoAlpha: 1, x: 0, duration: 0.5, delay: 0.35, ease: "power3.out" },
          );
        }

        const expand = contextSafe(() => {
          panel.setAttribute("data-expanded", "true");
          gsap.to(labels, {
            autoAlpha: 1,
            width: "auto",
            marginRight: 12,
            duration: duration(),
            ease: "power3.out",
            overwrite: "auto",
            onUpdate: () => syncIndicatorRef.current(),
            onComplete: () => syncIndicatorRef.current(),
          });
        });

        const collapse = contextSafe(() => {
          if (pointerInsideRef.current || panel.contains(document.activeElement)) return;
          panel.setAttribute("data-expanded", "false");
          gsap.to(labels, {
            autoAlpha: 0,
            width: 0,
            marginRight: 0,
            duration: duration(),
            ease: "power3.inOut",
            overwrite: "auto",
            onUpdate: () => syncIndicatorRef.current(),
            onComplete: () => syncIndicatorRef.current(),
          });
        });

        let leaveTimer = 0;
        const onEnter = contextSafe(() => {
          window.clearTimeout(leaveTimer);
          pointerInsideRef.current = true;
          expand();
        });
        const onLeave = contextSafe(() => {
          pointerInsideRef.current = false;
          window.clearTimeout(leaveTimer);
          leaveTimer = window.setTimeout(collapse, 80);
        });

        const onFocusIn = contextSafe(() => {
          window.clearTimeout(leaveTimer);
          expand();
        });
        const onFocusOut = contextSafe(() => {
          window.clearTimeout(leaveTimer);
          leaveTimer = window.setTimeout(collapse, 80);
        });

        panel.addEventListener("pointerenter", onEnter);
        panel.addEventListener("pointerleave", onLeave);
        panel.addEventListener("focusin", onFocusIn);
        panel.addEventListener("focusout", onFocusOut);

        return () => {
          window.clearTimeout(leaveTimer);
          pointerInsideRef.current = false;
          panel.removeEventListener("pointerenter", onEnter);
          panel.removeEventListener("pointerleave", onLeave);
          panel.removeEventListener("focusin", onFocusIn);
          panel.removeEventListener("focusout", onFocusOut);
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <nav
      ref={rootRef}
      aria-label={t("landing.sectionNavigation")}
      className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 md:inset-auto md:bottom-auto md:right-5 md:top-1/2 md:-translate-y-1/2 md:justify-end lg:right-7"
    >
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        <p className="rounded-full border border-white/50 bg-card/80 px-3 py-1 text-xs font-semibold text-foreground shadow-soft backdrop-blur-xl dark:border-border/80 md:hidden">
          {activeLabel}
        </p>
        <div ref={panelRef} data-expanded="false">
          <ul
            ref={listRef}
            className="relative flex items-center gap-1 rounded-2xl border border-white/50 bg-card/80 p-1.5 shadow-lift backdrop-blur-xl dark:border-border/80 md:flex-col md:items-stretch md:gap-1 md:p-2"
          >
            <span
              ref={indicatorRef}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 rounded-xl bg-primary shadow-glow"
            />
            {LANDING_SECTIONS.map((section) => {
              const active = section.id === activeId;
              const Icon = section.icon;
              return (
                <li key={section.id} className="relative z-10">
                  <a
                    href={`#${section.id}`}
                    data-section={section.id}
                    aria-current={active ? "true" : undefined}
                    aria-label={t(section.label)}
                    className="flex min-h-11 items-center justify-center p-1 text-left text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex-row-reverse md:justify-start"
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToLandingSection(section.id);
                      if (event.detail !== 0) {
                        event.currentTarget.blur();
                      }
                    }}
                  >
                    <span
                      data-section-icon
                      className={cn(
                        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center",
                        active ? "text-primary-foreground" : "text-current",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span
                      data-section-label
                      className="hidden overflow-hidden whitespace-nowrap text-sm font-semibold text-foreground md:inline-block md:w-0 md:opacity-0"
                    >
                      {t(section.label)}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
