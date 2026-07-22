import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function Visits() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Doctor Visits</h1>
        <p className="text-muted-foreground">Historical list of your doctor visits.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visit History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your visit history ordered from newest to oldest will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
