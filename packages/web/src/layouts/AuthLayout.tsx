import { useRef } from "react";
import { Outlet } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BrandMark } from "../components/layout/BrandMark";
import { AmbientBackground } from "../components/motion/AmbientBackground";

export function AuthLayout() {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const panel = cardRef.current;
      if (!panel) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(panel, { opacity: 1, y: 0 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          panel,
          { opacity: 0, y: 24, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" },
        );
      });

      return () => mm.revert();
    },
    { scope: cardRef },
  );

  return (
    <main className="app-canvas relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <AmbientBackground />
      <div ref={cardRef} className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandMark />
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Your health, clearly organized—logged, visualized, and ready for care.
          </p>
        </div>
        <Outlet />
      </div>
    </main>
  );
}
