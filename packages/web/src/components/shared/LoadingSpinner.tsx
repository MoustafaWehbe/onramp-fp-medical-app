import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

export function LoadingSpinner({
  className,
  size = "md",
}: LoadingSpinnerProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ring = rootRef.current;
      if (!ring) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(ring, { rotate: 0 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(ring, {
          rotate: 360,
          duration: 0.8,
          ease: "none",
          repeat: -1,
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Loading"
      className={cn(
        "rounded-full border-[3px] border-primary/20 border-t-primary text-primary",
        sizeMap[size],
        className,
      )}
    />
  );
}
