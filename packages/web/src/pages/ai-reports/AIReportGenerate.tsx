import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function AIReportGenerate() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Generate Report</h1>
        <p className="text-muted-foreground">Create a new AI-generated report.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Date range selection and report type selection will appear here.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Supported report types:
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
            <li><code>physician_ready</code> — Physician-ready summary</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
