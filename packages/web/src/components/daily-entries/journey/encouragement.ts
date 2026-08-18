import type { JourneyStepId } from "./steps";

const CONTINUE_MESSAGES: Partial<Record<JourneyStepId, string>> = {
  feelings: "Nice check-in",
  symptoms: "You're doing great",
  medications: "Good job",
  conditions: "Almost there",
};

const SKIP_MESSAGES: Partial<Record<JourneyStepId, string>> = {
  symptoms: "All good — onward",
  medications: "No problem, keep going",
  conditions: "Skipped. You're still doing great",
  visits: "On to the next stop",
};

export const FINISH_MESSAGE = "Well done today";

export function continueMessageFor(stepId: JourneyStepId): string {
  return CONTINUE_MESSAGES[stepId] ?? "Great work";
}

export function skipMessageFor(stepId: JourneyStepId): string {
  return SKIP_MESSAGES[stepId] ?? "Onward";
}
