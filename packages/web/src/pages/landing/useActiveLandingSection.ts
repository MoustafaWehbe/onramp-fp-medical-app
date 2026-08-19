import { useState } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LANDING_SECTIONS, type LandingSectionId } from "./sections";

export function useActiveLandingSection() {
  const [activeId, setActiveId] = useState<LandingSectionId>("hero");

  useGSAP(() => {
    const triggers = LANDING_SECTIONS.flatMap((section) => {
      const trigger = document.getElementById(section.id);
      if (!trigger) return [];
      return [
        ScrollTrigger.create({
          trigger,
          start: "top 45%",
          end: "bottom 45%",
          onEnter: () => setActiveId(section.id),
          onEnterBack: () => setActiveId(section.id),
        }),
      ];
    });

    let frame = 0;
    const refresh = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        ScrollTrigger.refresh();
      });
    };
    const images = Array.from(document.querySelectorAll<HTMLImageElement>("#landing-main img"));
    images.forEach((image) => image.addEventListener("load", refresh));
    window.addEventListener("load", refresh);
    refresh();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      triggers.forEach((trigger) => trigger.kill());
      images.forEach((image) => image.removeEventListener("load", refresh));
      window.removeEventListener("load", refresh);
    };
  });

  return activeId;
}
