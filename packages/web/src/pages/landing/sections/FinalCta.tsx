import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { LANDING_IMAGES } from "../images";

export function FinalCta() {
  return (
    <section
      id="get-started"
      data-landing-section
      className="scroll-mt-24 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-primary/15 shadow-lift sm:min-h-[24rem]">
        <img
          src={LANDING_IMAGES.wellness}
          alt=""
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/88 to-background/50" />
        <div className="relative flex min-h-[22rem] flex-col justify-center px-6 py-14 sm:min-h-[24rem] sm:px-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Ready when you are
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            Start a log you can actually bring to a visit.
          </h2>
          <p className="mt-3 max-w-lg text-base leading-7 text-muted-foreground">
            Create an account, record today, and keep the week visible—without scattering
            notes across apps. Your logs stay in your account.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className={cn(buttonVariants({ size: "lg" }), "rounded-full shadow-glow")}>
              Get started
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link to="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
