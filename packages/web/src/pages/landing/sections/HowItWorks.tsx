import { useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ClipboardList, LineChart, Stethoscope } from "lucide-react";
import { LANDING_IMAGES } from "../images";
import { refreshScrollTriggerOnImageLoad } from "../refreshOnImageLoad";
import { LANDING_SECTION_SCROLL_MARGIN_CLASS } from "../scroll";

const STEPS = [
  {
    icon: ClipboardList,
    titleKey: "logDay",
    bodyKey: "logDayBody",
    image: LANDING_IMAGES.logDay,
    alt: "Person writing notes in a journal",
  },
  {
    icon: LineChart,
    titleKey: "seePattern",
    bodyKey: "seePatternBody",
    image: LANDING_IMAGES.patterns,
    alt: "Laptop showing a data dashboard with charts",
  },
  {
    icon: Stethoscope,
    titleKey: "walkPrepared",
    bodyKey: "walkPreparedBody",
    image: LANDING_IMAGES.visit,
    alt: "Clinician speaking with a patient in a clinic",
  },
] as const;

export function HowItWorks() {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-how-card]", root);
      const dots = gsap.utils.toArray<HTMLElement>("[data-how-dot]", root);
      const mm = gsap.matchMedia();

      const setActiveDot = (activeIndex: number) => {
        dots.forEach((dot, index) => {
          dot.setAttribute("data-active", index === activeIndex ? "true" : "false");
        });
      };

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(cards, { clearProps: "transform,filter,opacity" });
        setActiveDot(0);
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-how-heading]", {
          autoAlpha: 0,
          y: 20,
          duration: 0.45,
          ease: "power2.out",
          scrollTrigger: {
            trigger: root,
            start: "top 85%",
            once: true,
          },
        });

        cards.forEach((card, index) => {
          const next = cards[index + 1];

          ScrollTrigger.create({
            trigger: card,
            start: "top 38%",
            end: "bottom 38%",
            onEnter: () => setActiveDot(index),
            onEnterBack: () => setActiveDot(index),
          });

          if (!next) return;

          gsap.to(card, {
            scale: 0.9,
            opacity: 0.55,
            filter: "saturate(0.7)",
            ease: "none",
            scrollTrigger: {
              trigger: next,
              start: "top 92%",
              end: "top 28%",
              scrub: 0.45,
            },
          });
        });

        return refreshScrollTriggerOnImageLoad(root);
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      id="how-it-works"
      ref={rootRef}
      className={`${LANDING_SECTION_SCROLL_MARGIN_CLASS} mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14`}
    >
      <div
        data-how-heading
        className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{t("landing.howEyebrow")}</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            {t("landing.howTitle")}
          </h2>
        </div>
        <div className="flex items-center gap-2" aria-hidden>
          {STEPS.map((step, index) => (
            <span
              key={step.titleKey}
              data-how-dot
              data-active={index === 0 ? "true" : "false"}
              className="h-2 w-2 rounded-full bg-muted-foreground/35 transition-colors data-[active=true]:bg-primary data-[active=true]:shadow-glow"
            />
          ))}
        </div>
      </div>

      <ol className="relative mt-10 w-full space-y-6 md:pr-16 lg:pr-20">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.titleKey}
              data-how-card
              style={{ zIndex: index + 1 }}
              className="sticky top-28 grid origin-top overflow-hidden rounded-[1.75rem] border border-primary/15 bg-card shadow-lift will-change-transform md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]"
            >
              <div className="relative min-h-[14rem] sm:min-h-[18rem] md:min-h-[22rem]">
                <img
                  src={step.image}
                  alt={step.alt}
                  width={1400}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 font-display text-sm font-bold shadow-soft backdrop-blur-md">
                  {index + 1}
                </span>
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {t(`landing.${step.titleKey}`)}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {t(`landing.${step.bodyKey}`)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
