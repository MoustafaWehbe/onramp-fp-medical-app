import { Check } from "lucide-react";
import { cn } from "../../../lib/utils";
import { JOURNEY_STEPS } from "./steps";

interface CheckInTrailProps {
  currentStep: number;
}

export function CheckInTrail({ currentStep }: CheckInTrailProps) {
  return (
    <ol className="flex w-full items-center" aria-label="Check-in progress">
      {JOURNEY_STEPS.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === JOURNEY_STEPS.length - 1;

        return (
          <li key={step.id} className={cn("flex items-center", !isLast && "min-w-0 flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-[transform,background-color,color,box-shadow] duration-200",
                  isComplete && "bg-primary text-primary-foreground shadow-sm",
                  isCurrent &&
                    "scale-110 bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20",
                  !isComplete && !isCurrent && "bg-muted text-muted-foreground",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isComplete ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Completed</span>
                  </>
                ) : (
                  <>
                    {index + 1}
                    <span className="sr-only">{isCurrent ? "Current" : "Pending"}</span>
                  </>
                )}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[0.65rem] font-semibold uppercase tracking-[0.08em]",
                  isCurrent ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step.shortLabel}
              </span>
            </div>
            {!isLast && (
              <span
                className={cn(
                  "mb-5 h-0.5 min-w-2 flex-1 rounded-full",
                  index < currentStep ? "bg-primary" : "bg-border",
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
