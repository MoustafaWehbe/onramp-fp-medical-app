import { useRef } from "react";
import { Moon, Sun } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTheme } from "../../providers/ThemeProvider";
import { prefersReducedMotion } from "../../lib/motion";
import { cn } from "../../lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const iconRef = useRef<HTMLSpanElement>(null);

  const { contextSafe } = useGSAP(() => undefined, { scope: iconRef });

  const handleToggle = contextSafe(() => {
    if (!prefersReducedMotion() && iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        { rotate: -90, scale: 0.72 },
        { rotate: 0, scale: 1, duration: 0.38, ease: "back.out(1.6)" },
      );
    }
    toggleTheme();
  });

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span ref={iconRef} className="inline-flex">
        {isDark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
      </span>
    </button>
  );
}
