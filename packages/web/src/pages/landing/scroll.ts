import gsap from "gsap";
import { prefersReducedMotion } from "../../lib/motion";

export function scrollToLandingSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return;

  if (prefersReducedMotion()) {
    section.scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }

  gsap.to(window, {
    duration: 0.75,
    ease: "power3.inOut",
    overwrite: true,
    scrollTo: { y: section, offsetY: 96 },
  });
}
