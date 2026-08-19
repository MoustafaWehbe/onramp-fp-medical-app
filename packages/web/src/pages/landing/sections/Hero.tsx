import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, HeartPulse, Moon, NotebookPen, Sparkles } from "lucide-react";
import { buttonVariants } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { LANDING_IMAGES } from "../images";
import { LANDING_SECTION_SCROLL_MARGIN_CLASS } from "../scroll";

const STATS = [
  { value: "1", key: "guidedCheckIn" },
  { value: "7–90", key: "trendViews" },
  { value: "AI", key: "visitReports" },
] as const;

export function Hero() {
  const { t } = useTranslation();
  return (
    <section
      id="hero"
      className={cn(
        "relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:pt-12",
        LANDING_SECTION_SCROLL_MARGIN_CLASS,
      )}
    >
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
        <div>
          <p
            data-hero-item
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("landing.heroEyebrow")}
          </p>
          <h1
            data-hero-item
            className="mt-5 max-w-xl font-display text-4xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[3.55rem] lg:leading-[1.05]"
          >
            {t("landing.heroTitle")}
          </h1>
          <p
            data-hero-item
            className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg"
          >
            {t("landing.heroBody")}
          </p>
          <div data-hero-item className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className={cn(buttonVariants({ size: "lg" }), "rounded-full shadow-glow")}>
              {t("landing.startLog")}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}
            >
              Sign in
            </Link>
          </div>
          <dl data-hero-item className="mt-10 grid grid-cols-3 gap-3 sm:max-w-lg">
            {STATS.map((stat) => (
              <div
                key={stat.key}
                className="rounded-2xl border border-primary/15 bg-card/70 px-3 py-3 shadow-soft backdrop-blur-sm"
              >
                <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t(`landing.${stat.key}`)}
                </dt>
                <dd className="mt-1 font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-hero-item className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-primary/15 shadow-lift">
            <img
              src={LANDING_IMAGES.hero}
              alt="Clinician reviewing a patient’s health notes together"
              width={1600}
              height={1066}
              fetchPriority="high"
              decoding="async"
              className="h-[22rem] w-full object-cover sm:h-[30rem] lg:h-[34rem]"
            />
          </div>
          <img
            src={LANDING_IMAGES.heroInset}
            alt="Clinician ready for a care visit"
            width={800}
            height={800}
            decoding="async"
            className="absolute right-4 top-4 hidden h-28 w-28 rounded-2xl border-4 border-card object-cover shadow-lift sm:block sm:h-36 sm:w-36 lg:right-6 lg:top-6"
          />
          <article className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/50 bg-card/90 p-4 shadow-lift backdrop-blur-xl dark:border-border/80 sm:bottom-6 sm:left-6 sm:right-auto sm:w-[19.5rem]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-primary">
                  {t("landing.todaysCheckIn")}
                </p>
                <h2 className="mt-1 font-display text-lg font-bold tracking-tight">18 Aug 2026</h2>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
                <HeartPulse className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-secondary/80 px-3 py-2">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">{t("landing.mood")}</p>
                <p className="text-sm font-bold">4 / 5</p>
              </div>
              <div className="rounded-xl bg-secondary/80 px-3 py-2">
                <p className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Moon className="h-3 w-3" aria-hidden />
                  {t("landing.sleep")}
                </p>
                <p className="text-sm font-bold">7.5 hrs</p>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <NotebookPen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              {t("landing.heroNote")}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
