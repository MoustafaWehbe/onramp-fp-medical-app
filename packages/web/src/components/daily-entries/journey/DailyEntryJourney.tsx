import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "../../ui/button";
import { CheckInTrail } from "./CheckInTrail";
import { StepCompleteBurst } from "./StepCompleteBurst";
import { JOURNEY_STEPS, LAST_JOURNEY_STEP } from "./steps";
import { FINISH_MESSAGE } from "./encouragement";

interface DailyEntryJourneyProps {
  currentStep: number;
  burstMessage: string | null;
  finishing: boolean;
  formError: string | null;
  isBusy: boolean;
  isCreateMode: boolean;
  isEditMode: boolean;
  navLocked?: boolean;
  children: ReactNode;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
  onCancel: () => void;
}

export function DailyEntryJourney({
  currentStep,
  burstMessage,
  finishing,
  formError,
  isBusy,
  isCreateMode,
  isEditMode,
  navLocked = false,
  children,
  onBack,
  onContinue,
  onSkip,
  onCancel,
}: DailyEntryJourneyProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const isLast = currentStep === LAST_JOURNEY_STEP;
  const canSkip = currentStep > 0 && !isLast;
  const stepMeta = JOURNEY_STEPS[currentStep];

  useGSAP(
    () => {
      const panel = stepRef.current;
      if (!panel) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(panel, { opacity: 1, x: 0, pointerEvents: "auto" });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          panel,
          { opacity: 0, x: 28 },
          { opacity: 1, x: 0, duration: 0.28, ease: "power2.out", pointerEvents: "auto" },
        );
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [currentStep], revertOnUpdate: true },
  );

  const submitLabel = isBusy
    ? isCreateMode
      ? "Submitting..."
      : "Updating..."
    : isCreateMode
      ? "Save entry"
      : isEditMode
        ? "Update entry"
        : "Save entry";

  return (
    <div ref={rootRef} className="relative flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border/70 px-4 pb-4 pt-1 sm:px-6">
        <p className="mb-3 text-center text-[0.65rem] font-bold uppercase tracking-[0.16em] text-primary">
          Stop {currentStep + 1} of {JOURNEY_STEPS.length}
        </p>
        <CheckInTrail currentStep={currentStep} />
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {formError && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
          >
            {formError}
          </p>
        )}

        <div ref={stepRef}>
          <div className="mb-5">
            <h3 className="text-lg font-bold tracking-tight">{stepMeta.title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {stepMeta.description}
            </p>
          </div>
          {children}
        </div>
      </div>

      <div className="sticky bottom-0 shrink-0 border-t border-border/70 bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={currentStep === 0 ? onCancel : onBack}
            disabled={isBusy || finishing || navLocked}
          >
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>

          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
            {canSkip && (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={onSkip}
                disabled={isBusy || finishing || navLocked}
              >
                Skip
              </Button>
            )}
            {isLast ? (
              <Button type="submit" className="w-full sm:w-auto" disabled={isBusy || finishing || navLocked}>
                {submitLabel}
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={onContinue}
                disabled={isBusy || finishing || navLocked}
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>

      {burstMessage && !finishing && <StepCompleteBurst message={burstMessage} />}
      {finishing && <StepCompleteBurst message={FINISH_MESSAGE} finish />}
    </div>
  );
}
