import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function AmbientBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const orbs = rootRef.current?.querySelectorAll(".ambient-orb");
      if (!orbs?.length) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(orbs, { x: 0, y: 0 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        orbs.forEach((orb, index) => {
          gsap.to(orb, {
            x: index % 2 === 0 ? 56 : -40,
            y: index % 2 === 0 ? -32 : 44,
            duration: 9 + index * 2.4,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="ambient-orb absolute -left-28 -top-28 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.28),transparent_68%)] dark:bg-[radial-gradient(circle,hsl(var(--primary)/0.22),transparent_68%)]" />
      <div className="ambient-orb absolute -right-20 top-[18%] h-72 w-72 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.22),transparent_70%)] dark:bg-[radial-gradient(circle,hsl(var(--accent)/0.16),transparent_70%)]" />
      <div className="ambient-orb absolute -bottom-24 left-[28%] h-64 w-64 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.14),transparent_70%)]" />
    </div>
  );
}
