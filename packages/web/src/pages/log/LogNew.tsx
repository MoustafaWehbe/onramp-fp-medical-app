import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function LogNew() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Daily Log</h1>
        <p className="text-muted-foreground">Record your daily health entry.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mood, sleep, and notes form will appear here.
          </p>
          <p className="text-sm text-muted-foreground">
            Associated symptoms, medications, and conditions can be added inline.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
