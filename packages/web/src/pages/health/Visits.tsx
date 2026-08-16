import { Stethoscope } from "lucide-react";
import { DoctorVisitCard } from "@/components/doctor-visits/DoctorVisitCard";
import { useDoctorVisitsContext } from "@/providers/DoctorVisitsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function DoctorVisitsPage() {
  const {
    doctorVisits,
    currentPage,
    totalCount,
    totalPages,
    isLoading,
    isFetching,
    isError,
    error,
    setCurrentPage,
    refetch,
  } = useDoctorVisitsContext();

  if (isLoading) {
    return (
      <div className="page-shell">
        <PageHeader
          eyebrow="Appointments"
          title="Doctor Visits"
          description="View your doctor visits and appointment history."
          icon={Stethoscope}
        />
        <div className="flex min-h-64 items-center justify-center rounded-2xl border bg-card shadow-soft">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-shell">
        <PageHeader
          eyebrow="Appointments"
          title="Doctor Visits"
          description="View your doctor visits and appointment history."
          icon={Stethoscope}
        />
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center shadow-soft"
        >
          <p className="text-sm text-destructive">
            {error?.message ?? "Failed to load doctor visits."}
          </p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Appointments"
        title="Doctor Visits"
        description="View your doctor visits and appointment history."
        icon={Stethoscope}
        badge={
          totalCount > 0 ? (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
              {totalCount} {totalCount === 1 ? "visit" : "visits"}
            </span>
          ) : undefined
        }
      />

      {doctorVisits.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center shadow-soft">
          <h2 className="text-lg font-semibold">No doctor visits yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your doctor visits will appear here once you add them to your daily
            entries.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {doctorVisits.map((visit) => (
              <DoctorVisitCard key={visit.id} visit={visit} />
            ))}
          </div>

          {isFetching && (
            <p className="text-center text-sm text-muted-foreground">Loading...</p>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  disabled={currentPage <= 1 || isFetching}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  disabled={currentPage >= totalPages || isFetching}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
