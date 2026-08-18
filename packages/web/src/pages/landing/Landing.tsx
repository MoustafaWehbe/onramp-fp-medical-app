import { useRef } from "react";
import { AmbientBackground } from "../../components/motion/AmbientBackground";
import { LandingNav } from "./LandingNav";
import { LandingSideNav } from "./LandingSideNav";
import { Hero } from "./sections/Hero";
import { HowItWorks } from "./sections/HowItWorks";
import { Features } from "./sections/Features";
import { Showcase } from "./sections/Showcase";
import { FinalCta } from "./sections/FinalCta";
import { LandingFooter } from "./sections/LandingFooter";
import { useActiveLandingSection } from "./useActiveLandingSection";
import { useLandingMotion } from "./useLandingMotion";

export function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const activeId = useActiveLandingSection();
  useLandingMotion(rootRef);

  return (
    <>
      <div ref={rootRef} className="app-canvas relative min-h-dvh overflow-x-clip">
        <AmbientBackground />
        <a
          href="#landing-main"
          className="absolute left-4 top-4 z-50 -translate-y-[180%] rounded-xl bg-card px-4 py-2 text-sm font-semibold shadow-lift focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <div className="relative z-10 pb-28 md:pb-8">
          <LandingNav activeId={activeId} />
          <main id="landing-main">
            <Hero />
            <HowItWorks />
            <Features />
            <Showcase />
            <FinalCta />
          </main>
          <LandingFooter />
        </div>
      </div>
      <LandingSideNav activeId={activeId} />
    </>
  );
}
