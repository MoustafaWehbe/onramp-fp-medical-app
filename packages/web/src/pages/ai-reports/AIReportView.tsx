import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function AIReportView() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Report #{id}</h1>
        <p className="text-muted-foreground">Printable physician-friendly report view.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Read-only report content for report {id} will appear here in a printable format.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
