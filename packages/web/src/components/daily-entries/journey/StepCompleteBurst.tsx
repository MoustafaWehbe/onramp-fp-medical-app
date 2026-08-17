import { useRef } from "react";
import { Check, HeartPulse } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface StepCompleteBurstProps {
  message: string;
  finish?: boolean;
}

export function StepCompleteBurst({ message, finish = false }: StepCompleteBurstProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-burst]", { autoAlpha: 1, scale: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
        timeline.fromTo(
          "[data-burst-icon]",
          { scale: 0.4, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.28, ease: "back.out(1.6)" },
        );
        timeline.fromTo(
          "[data-burst-copy]",
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.22 },
          "<0.08",
        );
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card/92 px-6 text-center backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div
        data-burst
        className="flex flex-col items-center gap-4"
      >
        <span
          data-burst-icon
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift"
        >
          {finish ? (
            <HeartPulse className="h-8 w-8" aria-hidden />
          ) : (
            <Check className="h-8 w-8" aria-hidden />
          )}
        </span>
        <p data-burst-copy className="text-xl font-bold tracking-tight sm:text-2xl">
          {message}
        </p>
        {finish && (
          <p className="text-sm text-muted-foreground">Saving your check-in…</p>
        )}
      </div>
    </div>
  );
}
