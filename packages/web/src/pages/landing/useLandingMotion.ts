import { type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function useLandingMotion(rootRef: RefObject<HTMLDivElement>) {
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const heroItems = gsap.utils.toArray<HTMLElement>("[data-hero-item]", root);
      const sections = gsap.utils.toArray<HTMLElement>("[data-landing-section]", root);
      const steps = gsap.utils.toArray<HTMLElement>("[data-showcase-step]", root);
      const report = root.querySelector<HTMLElement>("[data-showcase-report]");
      const showcase = root.querySelector<HTMLElement>("#showcase");
      const visibleTargets = [...heroItems, ...sections, ...steps, ...(report ? [report] : [])];

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(visibleTargets, {
          autoAlpha: 1,
          y: 0,
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(heroItems, {
          autoAlpha: 0,
          y: 20,
          duration: 0.45,
          stagger: 0.07,
          ease: "power3.out",
        });

        sections.forEach((section) => {
          if (section.id === "how-it-works" || section.id === "features") return;

          const cards = gsap.utils.toArray<HTMLElement>("[data-landing-card]", section);

          gsap.from(section, {
            autoAlpha: 0,
            y: 28,
            duration: 0.45,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none none",
              once: true,
            },
          });

          if (cards.length > 0) {
            gsap.from(cards, {
              autoAlpha: 0,
              y: 16,
              duration: 0.4,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 82%",
                toggleActions: "play none none none",
                once: true,
              },
            });
          }
        });

        if (showcase && steps.length > 0 && report) {
          gsap.from(steps, {
            autoAlpha: 0,
            y: 16,
            duration: 0.4,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: showcase,
              start: "top 80%",
              toggleActions: "play none none none",
              once: true,
            },
          });

          gsap.from(report, {
            autoAlpha: 0,
            y: 16,
            duration: 0.45,
            ease: "power2.out",
            scrollTrigger: {
              trigger: showcase,
              start: "top 72%",
              toggleActions: "play none none none",
              once: true,
            },
          });
        }
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );
}
