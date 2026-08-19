import gsap from "gsap";
import { prefersReducedMotion } from "../../lib/motion";

export const LANDING_SCROLL_OFFSET_Y = 96;
export const LANDING_SECTION_SCROLL_MARGIN_CLASS = "scroll-mt-24";

export function scrollToLandingSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return;

  const top = Math.max(
    0,
    section.getBoundingClientRect().top + window.scrollY - LANDING_SCROLL_OFFSET_Y,
  );

  if (prefersReducedMotion()) {
    window.scrollTo({ top, behavior: "auto" });
    return;
  }

  gsap.to(window, {
    duration: 0.75,
    ease: "power3.inOut",
    overwrite: true,
    scrollTo: { y: section, offsetY: LANDING_SCROLL_OFFSET_Y },
  });
}
