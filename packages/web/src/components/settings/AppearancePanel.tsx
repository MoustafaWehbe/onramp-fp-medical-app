import { useRef } from "react";
import { Moon, Palette, Sun } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTheme } from "../../providers/ThemeProvider";
import { cn } from "../../lib/utils";
import { SectionPanel } from "../shared/SectionPanel";

export function AppearancePanel() {
  const { theme, setTheme } = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const lightRef = useRef<HTMLButtonElement>(null);
  const darkRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const pill = pillRef.current;
      const active = theme === "light" ? lightRef.current : darkRef.current;
      if (!root || !pill || !active) return;

      const rootBox = root.getBoundingClientRect();
      const activeBox = active.getBoundingClientRect();
      const target = {
        x: activeBox.left - rootBox.left,
        y: activeBox.top - rootBox.top,
        width: activeBox.width,
        height: activeBox.height,
      };

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(pill, target);
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(pill, { ...target, duration: 0.32, ease: "power2.out" });
      });
    },
    { scope: rootRef, dependencies: [theme], revertOnUpdate: false },
  );

  return (
    <SectionPanel
      title="Preferences"
      description="Choose light or dark mode for this device."
      icon={Palette}
    >
      <div
        ref={rootRef}
        role="group"
        aria-label="Theme"
        className="relative grid grid-cols-2 rounded-2xl border border-border/70 bg-muted/70 p-1.5 shadow-soft"
      >
        <span
          ref={pillRef}
          className="pointer-events-none absolute left-0 top-0 z-0 h-11 w-1/2 rounded-xl bg-card shadow-glow"
          aria-hidden
        />
        <button
          ref={lightRef}
          type="button"
          aria-pressed={theme === "light"}
          className={cn(
            "relative z-10 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors",
            theme === "light"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTheme("light")}
        >
          <Sun className="h-4 w-4" aria-hidden />
          Light
        </button>
        <button
          ref={darkRef}
          type="button"
          aria-pressed={theme === "dark"}
          className={cn(
            "relative z-10 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors",
            theme === "dark"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-4 w-4" aria-hidden />
          Dark
        </button>
      </div>
    </SectionPanel>
  );
}
