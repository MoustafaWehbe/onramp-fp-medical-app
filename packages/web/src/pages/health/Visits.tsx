import { DoctorVisitCard } from "@/components/doctor-visits/DoctorVisitCard";
import { useDoctorVisitsContext } from "@/providers/DoctorVisitsProvider";

export function DoctorVisitsPage() {
const {
doctorVisits,
currentPage,
pageSize,
totalCount,
totalPages,
isLoading,
isFetching,
isError,
error,
setCurrentPage,
setPageSize,
refetch,
} = useDoctorVisitsContext();

if (isLoading) {
return ( <div className="container mx-auto px-4 py-6"> <h1 className="text-2xl font-bold tracking-tight">
Doctor Visits </h1>


    <div className="mt-6 flex items-center justify-center py-12">
      <p className="text-muted-foreground">
        Loading doctor visits...
      </p>
    </div>
  </div>
);


}

if (isError) {
return ( <div>
   <h1 className="text-2xl font-bold tracking-tight">Doctor Visits </h1>

    <div className="mt-6 rounded-lg border p-6 text-center">
      <p className="text-destructive">
        {error?.message ?? "Failed to load doctor visits."}
      </p>

      <button
        type="button"
        onClick={() => refetch()}
        className="mt-4 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
      >
        Try again
      </button>
    </div>
  </div>
);


}

return ( <div className="container mx-auto px-4 py-6">
{/* Page header */} <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"> <div> <h1 className="text-2xl font-bold tracking-tight">Doctor Visits </h1>


      <p className="text-sm text-muted-foreground">
        View your doctor visits and appointment history.
      </p>
    </div>

    {totalCount > 0 && (
      <p className="text-sm text-muted-foreground">
        {totalCount}{" "}
        {totalCount === 1 ? "visit" : "visits"}
      </p>
    )}
  </div>

  {/* Empty state */}
  {doctorVisits.length === 0 ? (
    <div className="mt-8 rounded-lg border p-8 text-center">
      <h2 className="text-lg font-medium">
        No doctor visits yet
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Your doctor visits will appear here once you add them
        to your daily entries.
      </p>
    </div>
  ) : (
    <>
      {/* Doctor visits list */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {doctorVisits.map((visit) => (
          <DoctorVisitCard
            key={visit.id}
            visit={visit}
          />
        ))}
      </div>

      {/* Fetching indicator when changing pages */}
      {isFetching && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || isFetching}
              onClick={() =>
                setCurrentPage(currentPage - 1)
              }
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                currentPage >= totalPages || isFetching
              }
              onClick={() =>
                setCurrentPage(currentPage + 1)
              }
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {/* Page size */}
          <select
            value={pageSize}
            onChange={(event) =>
              setPageSize(Number(event.target.value))
            }
            className="rounded-md border px-3 py-2 text-sm"
            aria-label="Visits per page"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      )}
    </>
  )}
</div>


);
}
