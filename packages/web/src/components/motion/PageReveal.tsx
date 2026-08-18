import { useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface PageRevealProps {
  children: ReactNode;
}

function PageRevealInner({ children }: PageRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const panel = rootRef.current;
      if (!panel) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(panel, { opacity: 1, y: 0 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          panel,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        );
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="w-full">
      {children}
    </div>
  );
}

export function PageReveal({ children }: PageRevealProps) {
  const { pathname } = useLocation();
  return <PageRevealInner key={pathname}>{children}</PageRevealInner>;
}
