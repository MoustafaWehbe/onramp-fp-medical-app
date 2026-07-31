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
     rounded-lg
     border
     bg-white
     p-5
     shadow-sm
     transition
     hover:shadow-md
   "
 >
{/* -------------------------------- */}
{/* Header                           */}
{/* -------------------------------- */}

  <div
    className="
      flex
      items-start
      justify-between
      gap-4
    "
  >
    <div>
      <h3
        className="
          text-lg
          font-semibold
          text-gray-900
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
          text-gray-500
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
        rounded-md
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
        rounded-md
        bg-gray-50
        p-3
      "
    >
      <p
        className="
          text-xs
          font-medium
          uppercase
          tracking-wide
          text-gray-500
        "
      >
        Mood
      </p>

      <p
        className="
          mt-1
          text-base
          font-semibold
          text-gray-900
        "
      >
        {hasMood
          ? `${entry.moodRating} / 10`
          : "Not recorded"}
      </p>
    </div>

    {/* Sleep */}

    <div
      className="
        rounded-md
        bg-gray-50
        p-3
      "
    >
      <p
        className="
          text-xs
          font-medium
          uppercase
          tracking-wide
          text-gray-500
        "
      >
        Sleep
      </p>

      <p
        className="
          mt-1
          text-base
          font-semibold
          text-gray-900
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
          text-gray-500
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
          text-gray-700
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
      text-gray-500
    "
  >
    <span>
      Symptoms:{" "}
      <strong className="text-gray-700">
        {entry.symptoms.length}
      </strong>
    </span>

    <span>
      Medications:{" "}
      <strong className="text-gray-700">
        {entry.medications.length}
      </strong>
    </span>

    <span>
      Conditions:{" "}
      <strong className="text-gray-700">
        {entry.conditions.length}
      </strong>
    </span>

    <span>
      Doctor visits:{" "}
      <strong className="text-gray-700">
        {entry.doctorVisits.length}
      </strong>
    </span>
  </div>
</article>


);
}
