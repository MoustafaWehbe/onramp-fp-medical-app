import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Trends dashboard for your health metrics.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mood Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Mood chart will appear here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sleep Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Sleep chart will appear here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Symptom Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Symptom frequency chart will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
