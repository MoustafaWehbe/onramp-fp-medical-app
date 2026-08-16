import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

function SkeletonStatCard() {
  return (
    <Card className="bg-card/80">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-2xl bg-muted" />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-7 w-12 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonEntryRow() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/30 px-3.5 py-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-3 w-40 animate-pulse rounded bg-muted" />
      </div>

      <div className="flex shrink-0 gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="page-shell">
      <div className="overflow-hidden rounded-[1.75rem] border border-primary/15 bg-card/80 px-5 py-6 shadow-soft sm:px-7 sm:py-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-muted sm:h-14 sm:w-14" />
          <div className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
            <div className="h-8 w-52 animate-pulse rounded bg-muted" />
            <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      <Card className="bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <SkeletonEntryRow />
          <SkeletonEntryRow />
          <SkeletonEntryRow />
        </CardContent>
      </Card>
    </div>
  );
}
