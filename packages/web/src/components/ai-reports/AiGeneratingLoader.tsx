import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

const STATUS_MESSAGES = [
  "Reading your entries…",
  "Spotting symptom patterns…",
  "Drafting the clinical summary…",
  "Polishing recommendations…",
] as const;

interface AiGeneratingLoaderProps {
  className?: string;
}

export function AiGeneratingLoader({ className }: AiGeneratingLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-6 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/15 motion-safe:animate-ping" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-glow">
          <Sparkles className="h-7 w-7" aria-hidden />
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold tracking-tight">
          Generating your report
        </p>
        <p className="min-h-5 text-sm text-muted-foreground">
          {STATUS_MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  );
}
