import { Link } from "react-router-dom";
import { BrandMark } from "../../../components/layout/BrandMark";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <BrandMark />
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Care, recorded with clarity. Your logs stay in your account.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm font-semibold" aria-label="Footer">
          <Link to="/login" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Link to="/register" className="text-primary hover:underline hover:underline-offset-4">
            Get started
          </Link>
        </nav>
      </div>
    </footer>
  );
}
