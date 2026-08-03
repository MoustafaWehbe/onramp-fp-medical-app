import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { RecentEntryItem } from "../../lib/dashboard/types";

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Recent Entries</CardTitle>

        <Link
          to="/log/view"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent>
        {entries.length === 0 ? (
          <div className="py-8 text-center">
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
          <ul className="divide-y">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {entry.entryDate}
                  </p>

                  {entry.journalSnippet && (
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.journalSnippet}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
                  {entry.moodRating != null && (
                    <span>
                      Mood:{" "}
                      <span className="font-medium text-foreground">
                        {MOOD_LABELS[entry.moodRating] ?? entry.moodRating}
                      </span>
                    </span>
                  )}

                  {entry.sleepHours != null && (
                    <span>
                      Sleep:{" "}
                      <span className="font-medium text-foreground">
                        {entry.sleepHours}h
                      </span>
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
