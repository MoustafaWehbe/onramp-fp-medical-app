import { Check, FileText, HeartPulse, Pill } from "lucide-react";
import { LANDING_IMAGES } from "../images";

const STOPS = [
  { id: "feel", label: "Feel", detail: "Mood 4/5 · 7.5 hours of sleep" },
  { id: "symptoms", label: "Symptoms", detail: "Mild headache noted at noon" },
  { id: "meds", label: "Meds", detail: "Evening dose marked as taken" },
  { id: "save", label: "Save", detail: "Check-in stored in your log" },
] as const;

export function Showcase() {
  return (
    <section
      id="showcase"
      className="scroll-mt-24 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/15 shadow-lift">
          <img
            src={LANDING_IMAGES.clinician}
            alt="Clinician smiling during a care visit"
            width={1200}
            height={800}
            loading="lazy"
            decoding="async"
            className="h-72 w-full object-cover sm:h-[30rem]"
          />
          <p className="absolute bottom-4 left-4 right-4 rounded-2xl bg-card/90 px-4 py-3 text-sm font-semibold shadow-soft backdrop-blur-xl">
            Bring a week of context into a 15-minute visit.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            See it in action
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            A day’s check-in becomes a visit-ready story.
          </h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Move through the same stops you will use in the app, then open a summary
            you can take to care.
          </p>

          <ol className="mt-6 space-y-3">
            {STOPS.map((stop, index) => (
              <li
                key={stop.id}
                data-showcase-step
                className="flex items-start gap-4 rounded-2xl border border-primary/15 bg-card px-4 py-4 shadow-soft"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index === STOPS.length - 1 ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <div>
                  <p className="font-display font-bold tracking-tight">{stop.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stop.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <article
            data-showcase-report
            className="mt-4 rounded-[1.75rem] border border-primary/15 bg-card p-5 shadow-lift sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
                <FileText className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Physician-ready report
                </p>
                <h3 className="font-display text-lg font-bold tracking-tight">11–18 Aug 2026</h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Mood stayed mostly steady. Sleep dipped mid-week. Headache appeared on two
              days and eased after the evening dose.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                <HeartPulse className="h-4 w-4 text-primary" aria-hidden />
                Average mood 3.8 / 5
              </li>
              <li className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                <Pill className="h-4 w-4 text-primary" aria-hidden />
                Medication taken 6 of 7 evenings
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
