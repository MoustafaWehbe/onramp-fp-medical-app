import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

const STATUS_MESSAGES = [
  "Reading your entries...",
  "Spotting symptom patterns...",
  "Drafting clinical summary...",
  "Polishing recommendations...",
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
        "flex flex-col items-center justify-center gap-8 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <span className="absolute inset-2 rounded-full border-2 border-primary/30 animate-pulse" />
        <span className="absolute inset-0 rounded-full border border-dashed border-primary/40 animate-spin [animation-duration:8s]" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
          <Sparkles className="h-7 w-7 animate-pulse" />
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          Generating your report
        </p>
        <p
          key={messageIndex}
          className="min-h-5 text-sm text-muted-foreground transition-opacity"
        >
          {STATUS_MESSAGES[messageIndex]}
        </p>
      </div>

      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
      </div>

      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/2 rounded-full bg-primary/70 animate-[shimmer_1.6s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(240%); }
        }
      `}</style>
    </div>
  );
}
