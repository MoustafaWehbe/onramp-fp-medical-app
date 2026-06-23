import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function Medications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Medications</h1>
        <p className="text-muted-foreground">Your personal medication registry.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Medications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Medication list with frequency, notes, and active status will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
