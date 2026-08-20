import type { JourneyStepId } from "./steps";

const CONTINUE_MESSAGES: Partial<Record<JourneyStepId, string>> = {
  feelings: "dailyEntries.journey.messages.feelings",
  symptoms: "dailyEntries.journey.messages.symptoms",
  medications: "dailyEntries.journey.messages.medications",
  conditions: "dailyEntries.journey.messages.conditions",
};

const SKIP_MESSAGES: Partial<Record<JourneyStepId, string>> = {
  symptoms: "dailyEntries.journey.messages.skipSymptoms",
  medications: "dailyEntries.journey.messages.skipMedications",
  conditions: "dailyEntries.journey.messages.skipConditions",
  visits: "dailyEntries.journey.messages.skipVisits",
};

export const FINISH_MESSAGE = "dailyEntries.journey.messages.finish";

export function continueMessageFor(stepId: JourneyStepId, t: (key: string) => string): string {
  return t(CONTINUE_MESSAGES[stepId] ?? "dailyEntries.journey.messages.defaultContinue");
}

export function skipMessageFor(stepId: JourneyStepId, t: (key: string) => string): string {
  return t(SKIP_MESSAGES[stepId] ?? "dailyEntries.journey.messages.defaultSkip");
}
