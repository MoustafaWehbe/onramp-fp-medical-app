export interface LoginLocationState {
  registered?: boolean;
}

export const ONBOARDING_DONE_KEY = "ht_onboarding_done";

export function markOnboardingDone(userId: string) {
  try {
    localStorage.setItem(`${ONBOARDING_DONE_KEY}_${userId}`, "1");
  } catch {
    // storage unavailable — allow the app to continue
  }
}

export function isOnboardingDone(userId: string): boolean {
  try {
    return localStorage.getItem(`${ONBOARDING_DONE_KEY}_${userId}`) === "1";
  } catch {
    return true;
  }
}
