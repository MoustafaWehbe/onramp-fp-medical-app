import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function HealthProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Health Profile</h1>
        <p className="text-muted-foreground">Manage your conditions and symptoms.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your tracked conditions will appear here.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your tracked symptoms will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
