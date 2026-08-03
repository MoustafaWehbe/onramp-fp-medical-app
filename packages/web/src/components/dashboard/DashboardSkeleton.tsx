import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

function SkeletonStatCard() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-muted" />

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
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-3 w-40 animate-pulse rounded bg-muted" />
      </div>

      <div className="flex shrink-0 gap-4">
        <div className="h-3 w-14 animate-pulse rounded bg-muted" />
        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="divide-y">
            <SkeletonEntryRow />
            <SkeletonEntryRow />
            <SkeletonEntryRow />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 p-6 sm:flex-row">
          <div className="h-9 w-full animate-pulse rounded bg-muted" />
          <div className="h-9 w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
