import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { LANDING_IMAGES } from "../images";

export function FinalCta() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const panel = root.querySelector<HTMLElement>("[data-cta-panel]");
      const photo = root.querySelector<HTMLElement>("[data-cta-photo]");
      const overlay = root.querySelector<HTMLElement>("[data-cta-overlay]");
      const items = gsap.utils.toArray<HTMLElement>("[data-cta-item]", root);
      const actions = gsap.utils.toArray<HTMLElement>("[data-cta-action]", root);
      const arrow = root.querySelector<HTMLElement>("[data-cta-arrow]");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([panel, photo, overlay, ...items, ...actions, arrow].filter(Boolean), {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          clipPath: "none",
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(panel, { clipPath: "inset(10% 14% 10% 14% round 2rem)" });
        gsap.set(photo, { scale: 1.12 });
        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(items, { autoAlpha: 0, y: 22 });
        gsap.set(actions, { autoAlpha: 0, y: 18, scale: 0.94 });
        gsap.set(arrow, { x: -8 });

        const timeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: root,
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        });

        timeline
          .to(panel, { clipPath: "inset(0% 0% 0% 0% round 2rem)", duration: 0.85 })
          .to(photo, { scale: 1, duration: 1.1, ease: "power2.out" }, 0)
          .to(overlay, { autoAlpha: 1, duration: 0.6 }, 0.1)
          .to(items, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.1 }, 0.28)
          .to(
            actions,
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.1, ease: "back.out(1.4)" },
            "-=0.12",
          )
          .to(arrow, { x: 0, duration: 0.35, ease: "power2.out" }, "-=0.2");
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      id="get-started"
      ref={rootRef}
      className="scroll-mt-24 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14"
    >
      <div
        data-cta-panel
        className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-primary/15 shadow-lift sm:min-h-[24rem]"
      >
        <img
          data-cta-photo
          src={LANDING_IMAGES.wellness}
          alt=""
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full origin-center object-cover"
        />
        <div
          data-cta-overlay
          className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/88 to-background/50"
        />
        <div className="relative flex min-h-[22rem] flex-col justify-center px-6 py-14 sm:min-h-[24rem] sm:px-12 sm:py-16">
          <p data-cta-item className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Ready when you are
          </p>
          <h2
            data-cta-item
            className="mt-3 max-w-xl font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl"
          >
            Start a log you can actually bring to a visit.
          </h2>
          <p data-cta-item className="mt-3 max-w-lg text-base leading-7 text-muted-foreground">
            Create an account, record today, and keep the week visible—without scattering
            notes across apps. Your logs stay in your account.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              data-cta-action
              to="/register"
              className={cn(buttonVariants({ size: "lg" }), "rounded-full shadow-glow")}
            >
              Get started
              <ArrowRight data-cta-arrow className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link
              data-cta-action
              to="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
