import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { RecentEntryItem } from "../../lib/dashboard/types";
import { formatDate } from "../../lib/utils";

const MOOD_LABELS: Record<number, string> = {
  1: "Very Low",
  2: "Low",
  3: "Neutral",
  4: "Good",
  5: "Great",
};

interface RecentEntriesProps {
  entries: RecentEntryItem[];
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Recent Entries</CardTitle>

        <Link
          to="/log/view"
          className="flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent>
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/30 px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No entries yet.
            </p>

            <Link
              to="/log/view"
              className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
            >
              Create your first entry
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col items-start justify-between gap-2 rounded-2xl bg-muted/35 px-3.5 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {formatDate(entry.entryDate)}
                  </p>

                  {entry.journalSnippet && (
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.journalSnippet}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs">
                  {entry.moodRating != null && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                      {MOOD_LABELS[entry.moodRating] ?? entry.moodRating}
                    </span>
                  )}

                  {entry.sleepHours != null && (
                    <span className="rounded-full bg-secondary px-2.5 py-1 font-semibold text-secondary-foreground">
                      {entry.sleepHours}h sleep
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
