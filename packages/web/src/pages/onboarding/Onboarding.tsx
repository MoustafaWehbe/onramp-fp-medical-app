import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  LineChart,
  Pill,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { markOnboardingDone } from "../../lib/auth/location-state";
import { prefersReducedMotion } from "../../lib/motion";
import { AmbientBackground } from "../../components/motion/AmbientBackground";
import { BrandMark } from "../../components/layout/BrandMark";
import { ThemeToggle } from "../../components/layout/ThemeToggle";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

const STEPS = [
  {
    eyebrow: "Welcome",
    title: "Your health, clearly recorded.",
    body: "HealthTrack gives you one calm place to log every day—mood, sleep, symptoms, medications, and visits—so nothing slips through before a care appointment.",
    icon: HeartPulse,
    color: "from-primary to-accent",
    features: [
      { icon: CalendarDays, label: "Daily check-in in minutes" },
      { icon: Activity, label: "Symptoms & conditions" },
      { icon: Pill, label: "Medications & dosages" },
    ],
  },
  {
    eyebrow: "Step 1 of 3",
    title: "Log the day.",
    body: "Every day starts with a short guided check-in. Rate your mood, note sleep hours, flag any symptoms or medications, and jot a quick journal note. Skip anything that doesn't apply.",
    icon: ClipboardList,
    color: "from-primary to-accent",
    features: [
      { icon: Activity, label: "Mood and energy (1–5)" },
      { icon: CalendarDays, label: "Sleep hours" },
      { icon: ClipboardList, label: "Optional journal note" },
    ],
  },
  {
    eyebrow: "Step 2 of 3",
    title: "See the pattern.",
    body: "Charts pull from your own entries. Spot trends in mood, sleep, and symptom frequency across 7, 30, or 90 days—without digging through a wall of text.",
    icon: LineChart,
    color: "from-primary to-accent",
    features: [
      { icon: LineChart, label: "Mood and sleep trends" },
      { icon: Activity, label: "Symptom frequency" },
      { icon: Sparkles, label: "7, 30, and 90-day views" },
    ],
  },
  {
    eyebrow: "Step 3 of 3",
    title: "Walk into care prepared.",
    body: "When a visit is coming up, pick a date range and generate a physician-ready summary from your entries. Hand it to your doctor so the conversation starts with context.",
    icon: Stethoscope,
    color: "from-primary to-accent",
    features: [
      { icon: Stethoscope, label: "Physician-ready summary" },
      { icon: CalendarDays, label: "Any date range you choose" },
      { icon: Sparkles, label: "AI-assisted formatting" },
    ],
  },
] as const;

export function Onboarding() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isLast = step === STEPS.length - 1;

  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(card, { autoAlpha: 1, y: 0, scale: 1 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 32, scale: 0.975 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" },
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const animateStep = (next: number) => {
    const content = contentRef.current;
    if (!content || prefersReducedMotion()) {
      setStep(next);
      return;
    }

    const direction = next > step ? 1 : -1;
    gsap.to(content, {
      autoAlpha: 0,
      x: -28 * direction,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        setStep(next);
        gsap.fromTo(
          content,
          { autoAlpha: 0, x: 28 * direction },
          { autoAlpha: 1, x: 0, duration: 0.3, ease: "power3.out" },
        );
      },
    });
  };

  const handleNext = () => {
    if (isLast) {
      if (user) markOnboardingDone(user.id);
      navigate("/dashboard", { replace: true });
    } else {
      animateStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) animateStep(step - 1);
  };

  const handleSkip = () => {
    if (user) markOnboardingDone(user.id);
    navigate("/dashboard", { replace: true });
  };

  const current = STEPS[step];
  const translatedSteps = t("onboarding.steps", { returnObjects: true }) as Array<{
    eyebrow: string;
    title: string;
    body: string;
    features: string[];
  }>;
  const translatedCurrent = translatedSteps[step];
  const Icon = current.icon;

  return (
    <div ref={rootRef} className="app-canvas relative min-h-dvh overflow-x-clip">
      <AmbientBackground />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-4 sm:px-6">
        <header className="flex items-center justify-between gap-2">
          <BrandMark compact className="sm:hidden" />
          <BrandMark className="hidden sm:flex" />
          <div className="ml-auto flex items-center gap-2">
            {step < STEPS.length - 1 && (
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t("onboarding.skip")}
              </button>
            )}
            <ThemeToggle className="rounded-full" />
          </div>
        </header>

        <div
          ref={cardRef}
          className="my-auto flex flex-col gap-6 py-8"
        >
          <div className="flex items-center gap-3">
            {STEPS.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={t("onboarding.goToStep", { step: index + 1 })}
                aria-current={index === step ? "step" : undefined}
                onClick={() => {
                  if (index < step) animateStep(index);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  index === step
                    ? "w-8 bg-primary shadow-glow"
                    : index < step
                      ? "w-4 cursor-pointer bg-primary/50 hover:bg-primary/70"
                      : "w-4 cursor-default bg-muted-foreground/25",
                )}
              />
            ))}
          </div>

          <div
            ref={contentRef}
            className="overflow-hidden rounded-[2rem] border border-white/60 bg-card/90 shadow-lift backdrop-blur-xl dark:border-border/80"
          >
            <div className="relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.2),transparent_70%)]" />
              <div className="pointer-events-none absolute -bottom-20 left-1/4 h-44 w-44 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.14),transparent_70%)]" />

              <div className="relative">
                <div className="flex items-start gap-5">
                  <div
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-primary-foreground shadow-glow",
                      current.color,
                    )}
                  >
                    <Icon className="h-7 w-7" aria-hidden />
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      {translatedCurrent.eyebrow}
                    </p>
                    <h1 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                      {translatedCurrent.title}
                    </h1>
                  </div>
                </div>

                <p className="mt-5 text-base leading-7 text-muted-foreground">
                  {translatedCurrent.body}
                </p>

                <ul className="mt-6 space-y-2.5">
                  {translatedCurrent.features.map((feature, featureIndex) => {
                    const featureIcon = current.features[featureIndex].icon;
                    const FeatureIcon = featureIcon;
                    return (
                      <li
                        key={feature}
                        className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-secondary/50 px-4 py-3"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FeatureIcon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="text-sm font-semibold">{feature}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border/60 px-6 py-4 sm:px-8">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t("onboarding.back")}
                </button>
              ) : (
                <div />
              )}
              <Button
                onClick={handleNext}
                className="rounded-full shadow-glow"
              >
                {isLast ? t("onboarding.openDashboard") : t("onboarding.next")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>

          <p className="text-center text-xs leading-5 text-muted-foreground">
            {t("onboarding.progress", { current: step + 1, total: STEPS.length })}
          </p>
        </div>
      </div>
    </div>
  );
}
