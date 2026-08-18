import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../../../lib/utils";
import {
  Activity,
  Building2,
  ClipboardList,
  FileText,
  LineChart,
  Pill,
} from "lucide-react";
import { LANDING_IMAGES } from "../images";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Daily check-in",
    body: "Mood, sleep, and a journal note in a guided journey you can finish in minutes.",
    image: LANDING_IMAGES.checkIn,
    alt: "Person using a health app on a phone during a consultation",
    wide: true,
  },
  {
    icon: Activity,
    title: "Symptoms and conditions",
    body: "Keep the health profile you actually live with, then attach it to a day’s log.",
  },
  {
    icon: Pill,
    title: "Medications",
    body: "Dosages, units, and whether a dose was taken—organized in one reliable record.",
    image: LANDING_IMAGES.medications,
    alt: "Assorted medication capsules and tablets",
  },
  {
    icon: Building2,
    title: "Care network",
    body: "Save clinics and doctors, then note visits alongside the rest of the day.",
    image: LANDING_IMAGES.clinic,
    alt: "Bright clinic corridor with seating",
  },
  {
    icon: LineChart,
    title: "Analytics",
    body: "Mood, sleep, and symptom frequency across 7, 30, or 90 days.",
  },
  {
    icon: FileText,
    title: "AI reports",
    body: "A physician-ready summary from your entries for a date range you choose.",
  },
] as const;

export function Features() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-feature-card]", root);
      const heading = root.querySelector<HTMLElement>("[data-features-heading]");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([heading, ...cards].filter(Boolean), { autoAlpha: 1, x: 0, y: 0, rotate: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (heading) {
          gsap.from(heading, {
            autoAlpha: 0,
            y: 20,
            duration: 0.45,
            ease: "power2.out",
            scrollTrigger: {
              trigger: heading,
              start: "top 85%",
              once: true,
            },
          });
        }

        gsap.set(cards, {
          autoAlpha: 0,
          y: 56,
          x: (index) => (index % 2 === 0 ? -40 : 40),
          rotate: (index) => (index % 2 === 0 ? -2.5 : 2.5),
        });

        ScrollTrigger.batch(cards, {
          start: "top 88%",
          interval: 0.14,
          batchMax: 3,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              rotate: 0,
              duration: 0.7,
              stagger: 0.12,
              ease: "power3.out",
              overwrite: true,
            }),
          onLeaveBack: (batch) =>
            gsap.to(batch, {
              autoAlpha: 0,
              y: 56,
              x: (index, element) => {
                const cardIndex = cards.indexOf(element as HTMLElement);
                return cardIndex % 2 === 0 ? -40 : 40;
              },
              rotate: (index, element) => {
                const cardIndex = cards.indexOf(element as HTMLElement);
                return cardIndex % 2 === 0 ? -2.5 : 2.5;
              },
              duration: 0.35,
              stagger: 0.06,
              ease: "power2.in",
              overwrite: true,
            }),
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      id="features"
      ref={rootRef}
      className="scroll-mt-24 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14"
    >
      <div data-features-heading className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Features</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
          Everything you already track, in one HealthTrack record.
        </h2>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          const wide = "wide" in feature && feature.wide;
          const image = "image" in feature ? feature.image : null;
          const alt = "alt" in feature ? feature.alt : "";

          return (
            <article
              key={feature.title}
              data-feature-card
              className={cn(
                "overflow-hidden rounded-[1.75rem] border border-primary/15 bg-card shadow-soft",
                wide && "sm:col-span-2 lg:col-span-2",
              )}
            >
              {image && (
                <img
                  src={image}
                  alt={alt}
                  width={wide ? 1400 : 900}
                  height={wide ? 800 : 600}
                  loading="lazy"
                  decoding="async"
                  className={cn("w-full object-cover", wide ? "h-52 sm:h-64" : "h-40")}
                />
              )}
              <div className="p-5 sm:p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
