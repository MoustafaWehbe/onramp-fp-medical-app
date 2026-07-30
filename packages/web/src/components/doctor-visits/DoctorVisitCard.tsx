import {
  Stethoscope,
  Building2,
  MapPin,
  NotebookPen,
  CalendarDays,
} from "lucide-react";

import type { EntryDoctorVisit } from "@/lib/doctor-visit-entries/doctor-visit-exports";
import { cn } from "@/lib/utils";

interface DoctorVisitCardProps {
  visit: EntryDoctorVisit;
  onClick?: () => void;
}

export function DoctorVisitCard({
  visit,
  onClick,
}: DoctorVisitCardProps) {
  const doctorName =
    visit.userDoctor?.doctor?.name ??
    "Unknown doctor";

  const specialty =
    visit.userDoctor?.doctor?.specialty;

  const clinic =
    visit.userClinic?.clinic;

  const formattedDate =
    new Date(
      `${visit.entry.entryDate}T00:00:00`,
    ).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-all",
        "hover:border-primary/40 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-primary/10
            text-primary
            transition-colors
            group-hover:bg-primary/15
          "
        >
          <Stethoscope
            className="h-5 w-5"
            aria-hidden
          />
        </div>


        <div className="min-w-0 flex-1 space-y-2">

          {/* Header */}
          <div>
            <h3
              className="
                truncate
                font-semibold
                leading-tight
                tracking-tight
              "
            >
              {doctorName}
            </h3>

            {specialty && (
              <p className="text-sm text-muted-foreground">
                {specialty}
              </p>
            )}
          </div>


          {/* Date */}
          <div
            className="
              flex
              items-center
              gap-1.5
              text-sm
              text-muted-foreground
            "
          >
            <CalendarDays
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden
            />

            {formattedDate}
          </div>


          {/* Clinic */}
          {clinic && (
            <div
              className="
                space-y-1
                text-sm
                text-muted-foreground
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  font-medium
                  text-foreground
                "
              >
                <Building2
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden
                />

                {clinic.name}
              </div>


              {clinic.address && (
                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <MapPin
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden
                  />

                  <span className="line-clamp-1">
                    {clinic.address}
                  </span>
                </div>
              )}
            </div>
          )}


          {/* Summary */}
          {visit.summary && (
            <p
              className="
                flex
                items-start
                gap-1.5
                text-sm
                text-muted-foreground
              "
            >
              <NotebookPen
                className="
                  mt-0.5
                  h-3.5
                  w-3.5
                  shrink-0
                "
                aria-hidden
              />

              <span className="line-clamp-2">
                {visit.summary}
              </span>
            </p>
          )}

        </div>
      </div>
    </button>
  );
}