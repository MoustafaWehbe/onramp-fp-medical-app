import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function LogEntry() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Entry #{id}</h1>
        <p className="text-muted-foreground">Detailed historical entry view.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entry Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Full details for entry {id} will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
