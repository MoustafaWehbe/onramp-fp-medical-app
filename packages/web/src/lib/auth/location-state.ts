export interface LoginLocationState {
  registered?: boolean;
  /** Pre-fill the email field when redirecting from registration. */
  email?: string;
  /** Surface a sign-in error that occurred right after a successful registration. */
  loginError?: string;
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
