export const JOURNEY_STEPS = [
  { id: "feelings", shortLabel: "Feel", title: "How you feel", description: "A quick check-in on mood, sleep, and anything on your mind." },
  { id: "symptoms", shortLabel: "Symptoms", title: "Symptoms", description: "Add anything you noticed today, or skip if you felt fine." },
  { id: "medications", shortLabel: "Meds", title: "Medications", description: "Log what you took today, or skip if nothing changed." },
  { id: "conditions", shortLabel: "Status", title: "Conditions", description: "Update how your conditions are feeling today." },
  { id: "visits", shortLabel: "Visits", title: "Doctor visits", description: "Note any visits related to today, then save your check-in." },
] as const;

export type JourneyStepId = (typeof JOURNEY_STEPS)[number]["id"];
export const LAST_JOURNEY_STEP = JOURNEY_STEPS.length - 1;
