export const STEP_BURST_MS = 700;
export const SAVE_CELEBRATION_MS = 800;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function wait(ms: number): Promise<void> {
  if (typeof window === "undefined" || prefersReducedMotion() || ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
