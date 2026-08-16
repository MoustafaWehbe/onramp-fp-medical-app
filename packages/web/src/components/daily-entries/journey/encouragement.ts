const CONTINUE_MESSAGES = [
  "Nice check-in",
  "You're doing great",
  "Good job",
  "Almost there",
] as const;

const SKIP_MESSAGES = [
  "All good — onward",
  "No problem, keep going",
  "Skipped. You're still doing great",
  "On to the next stop",
] as const;

export const FINISH_MESSAGE = "Well done today";

export function continueMessageFor(stepIndex: number): string {
  return CONTINUE_MESSAGES[stepIndex] ?? "Great work";
}

export function skipMessageFor(stepIndex: number): string {
  return SKIP_MESSAGES[Math.max(0, stepIndex - 1)] ?? "Onward";
}
