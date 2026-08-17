import { Link } from "react-router-dom";

interface EmptyCatalogHintProps {
  to: string;
  actionLabel: string;
}

export function EmptyCatalogHint({ to, actionLabel }: EmptyCatalogHintProps) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
      <p>
        Nothing to add yet.{" "}
        <Link
          to={to}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {actionLabel}
        </Link>{" "}
        first, then return to finish this check-in.
      </p>
    </div>
  );
}
