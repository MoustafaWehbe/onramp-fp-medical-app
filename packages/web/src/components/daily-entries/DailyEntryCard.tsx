import type { DailyEntry } from "../../lib/daily-entries/daily-entries-exports";

interface DailyEntryCardProps {
entry: DailyEntry;
onClick: () => void;
}

/**

* Formats an ISO date/string into a readable date.
*
* Example:
* 2026-07-28
* ->
* 28 July 2026
  */
  function formatEntryDate(
  entryDate: string,
  ): string {
  const date = new Date(
  `${entryDate}T00:00:00`,
  );

if (Number.isNaN(date.getTime())) {
return entryDate;
}

return new Intl.DateTimeFormat(
"en-GB",
{
day: "numeric",
month: "long",
year: "numeric",
},
).format(date);
}

export function DailyEntryCard({
entry,
onClick,
}: DailyEntryCardProps) {
const hasMood =
entry.moodRating !== null;

const hasSleep =
entry.sleepHours !== null;

const hasJournal =
Boolean(
entry.journalNotes?.trim(),
);

return ( <article
   className="
 rounded-2xl
 border
 bg-card
 text-card-foreground
 p-5
 shadow-soft
 transition
 hover:shadow-lift
 "
 >
{/* -------------------------------- */}
{/* Header                           */}
{/* -------------------------------- */}

  <div
    className="
      flex
      flex-col
      items-start
      justify-between
      gap-4
      sm:flex-row
    "
  >
    <div>
      <h3
        className="
          text-lg
          font-semibold
         text-foreground
        "
      >
        {formatEntryDate(
          entry.entryDate,
        )}
      </h3>

      <p
        className="
          mt-1
          text-sm
         text-muted-foreground
        "
      >
        Daily health entry
      </p>
    </div>

    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex
        items-center
        justify-center
        gap-2
        min-h-11
        rounded-xl
        bg-primary
        px-4
        py-2
        text-sm
        font-medium
        text-primary-foreground
        transition
        hover:bg-primary/90
      "
    >
      View details
    </button>
  </div>

  {/* -------------------------------- */}
  {/* Basic information                */}
  {/* -------------------------------- */}

  <div
    className="
      mt-5
      grid
      grid-cols-1
      gap-4
      sm:grid-cols-2
    "
  >
    {/* Mood */}

    <div
      className="
        rounded-xl
       bg-muted
        p-3
      "
    >
      <p
        className="
          text-xs
          font-medium
          uppercase
          tracking-wide
          text-muted-foreground
        "
      >
        Mood
      </p>

      <p
        className="
          mt-1
          text-base
          font-semibold
          text-foreground
        "
      >
        {hasMood
          ? `${entry.moodRating} / 5`
          : "Not recorded"}
      </p>
    </div>

    {/* Sleep */}

    <div
      className="
        rounded-xl
        bg-muted
        p-3
      "
    >
      <p
        className="
          text-xs
          font-medium
          uppercase
          tracking-wide
          text-muted-foreground
        "
      >
        Sleep
      </p>

      <p
        className="
          mt-1
          text-base
          font-semibold
         text-foreground
        "
      >
        {hasSleep
          ? `${entry.sleepHours} hours`
          : "Not recorded"}
      </p>
    </div>
  </div>

  {/* -------------------------------- */}
  {/* Journal preview                  */}
  {/* -------------------------------- */}

  {hasJournal && (
    <div
      className="
        mt-5
        border-t
        pt-4
      "
    >
      <p
        className="
          text-xs
          font-medium
          uppercase
          tracking-wide
         text-muted-foreground
        "
      >
        Journal
      </p>

      <p
        className="
          mt-2
          line-clamp-2
          text-sm
          leading-6
          text-foreground
        "
      >
        {entry.journalNotes}
      </p>
    </div>
  )}

  {/* -------------------------------- */}
  {/* Related data summary             */}
  {/* -------------------------------- */}

  <div
    className="
      mt-5
      flex
      flex-wrap
      gap-3
      border-t
      pt-4
      text-sm
      text-muted-foreground
    "
  >
    <span>
      Symptoms:{" "}
      <strong className="text-foreground">
        {entry.symptoms.length}
      </strong>
    </span>

    <span>
      Medications:{" "}
      <strong className="text-foreground">
        {entry.medications.length}
      </strong>
    </span>

    <span>
      Conditions:{" "}
      <strong className="text-foreground">
        {entry.conditions.length}
      </strong>
    </span>

    <span>
      Doctor visits:{" "}
      <strong className="text-foreground">
        {entry.doctorVisits.length}
      </strong>
    </span>
  </div>
</article>


);
}
