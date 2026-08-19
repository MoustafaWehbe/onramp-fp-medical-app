import { useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Check, FileText, HeartPulse, Pill } from "lucide-react";
import { cn } from "../../../lib/utils";
import { LANDING_IMAGES } from "../images";
import { refreshScrollTriggerOnImageLoad } from "../refreshOnImageLoad";
import { LANDING_SECTION_SCROLL_MARGIN_CLASS } from "../scroll";

const STOPS = [
  { id: "feel", labelKey: "feel", detailKey: "feelDetail" },
  { id: "symptoms", labelKey: "symptoms", detailKey: "symptomsDetail" },
  { id: "meds", labelKey: "meds", detailKey: "medsDetail" },
  { id: "save", labelKey: "save", detailKey: "saveDetail" },
] as const;

export function Showcase() {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const photo = root.querySelector<HTMLElement>("[data-showcase-photo]");
      const caption = root.querySelector<HTMLElement>("[data-showcase-caption]");
      const copy = root.querySelector<HTMLElement>("[data-showcase-copy]");
      const progress = root.querySelector<HTMLElement>("[data-showcase-progress]");
      const steps = gsap.utils.toArray<HTMLElement>("[data-showcase-step]", root);
      const report = root.querySelector<HTMLElement>("[data-showcase-report]");
      const mm = gsap.matchMedia();

      const visible = [photo, caption, copy, progress, report, ...steps].filter(Boolean);

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(visible, { autoAlpha: 1, x: 0, y: 0, scale: 1, scaleY: 1 });
        steps.forEach((step) => step.setAttribute("data-active", "true"));
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(steps, { autoAlpha: 0.38, y: 18 });
        gsap.set(progress, { scaleY: 0, transformOrigin: "top center" });
        gsap.set(report, { autoAlpha: 0, y: 28, scale: 0.96 });

        gsap.fromTo(
          photo,
          { scale: 1.1 },
          {
            scale: 1,
            duration: 1.15,
            ease: "power2.out",
            scrollTrigger: { trigger: root, start: "top 78%", once: true },
          },
        );

        gsap.from(caption, {
          autoAlpha: 0,
          y: 16,
          duration: 0.45,
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: { trigger: root, start: "top 78%", once: true },
        });

        gsap.from(copy, {
          autoAlpha: 0,
          y: 16,
          duration: 0.45,
          ease: "power2.out",
          scrollTrigger: { trigger: copy ?? root, start: "top 85%", once: true },
        });

        const timeline = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: root,
            start: "top 62%",
            toggleActions: "play none none reverse",
          },
        });

        steps.forEach((step, index) => {
          timeline.to(
            step,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.34,
              onStart: () => {
                steps.forEach((item, itemIndex) => {
                  item.setAttribute("data-active", itemIndex === index ? "true" : "false");
                });
              },
            },
            index === 0 ? 0 : ">-0.08",
          );
          timeline.to(
            progress,
            {
              scaleY: (index + 1) / steps.length,
              duration: 0.34,
              ease: "none",
            },
            "<",
          );
        });

        timeline.to(
          report,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" },
          "-=0.05",
        );

        return refreshScrollTriggerOnImageLoad(root);
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      id="showcase"
      ref={rootRef}
      className={`${LANDING_SECTION_SCROLL_MARGIN_CLASS} mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14`}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/15 shadow-lift">
          <img
            data-showcase-photo
            src={LANDING_IMAGES.clinician}
            alt="Clinician smiling during a care visit"
            width={1200}
            height={800}
            loading="lazy"
            decoding="async"
            className="h-72 w-full origin-center object-cover sm:h-[30rem]"
          />
          <p
            data-showcase-caption
            className="absolute bottom-4 left-4 right-4 rounded-2xl bg-card/90 px-4 py-3 text-sm font-semibold shadow-soft backdrop-blur-xl"
          >
            {t("landing.bringContext")}
          </p>
        </div>

        <div>
          <div data-showcase-copy>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {t("landing.showcaseEyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
              {t("landing.showcaseTitle")}
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {t("landing.showcaseBody")}
            </p>
          </div>

          <div className="relative mt-6">
            <span
              aria-hidden
              className="absolute bottom-5 left-9 top-5 w-px bg-border"
            />
            <span
              data-showcase-progress
              aria-hidden
              className="absolute left-9 top-5 h-[calc(100%-2.5rem)] w-px origin-top bg-primary"
            />
            <ol className="space-y-3">
              {STOPS.map((stop, index) => (
                <li
                  key={stop.id}
                  data-showcase-step
                  data-active="false"
                  className={cn(
                    "relative flex items-start gap-4 rounded-2xl border bg-card px-4 py-4 shadow-soft transition-[border-color,box-shadow] duration-300",
                    "border-primary/15 data-[active=true]:border-primary/45 data-[active=true]:shadow-lift",
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index === STOPS.length - 1 ? (
                      <Check className="h-4 w-4" aria-hidden />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div>
                    <p className="font-display font-bold tracking-tight">{t(`landing.${stop.labelKey}`)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t(`landing.${stop.detailKey}`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <article
            data-showcase-report
            className="mt-4 rounded-[1.75rem] border border-primary/15 bg-card p-5 shadow-lift sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
                <FileText className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  {t("landing.reportEyebrow")}
                </p>
                <h3 className="font-display text-lg font-bold tracking-tight">11–18 Aug 2026</h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {t("landing.reportSummary")}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                <HeartPulse className="h-4 w-4 text-primary" aria-hidden />
                {t("landing.averageMood")}
              </li>
              <li className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                <Pill className="h-4 w-4 text-primary" aria-hidden />
                {t("landing.medicationTaken")}
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
