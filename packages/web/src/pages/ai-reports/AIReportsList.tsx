import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function AIReportsList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Reports</h1>
          <p className="text-muted-foreground">Previously generated AI reports.</p>
        </div>
        <Link to="/ai-reports/generate">
          <Button>Generate New Report</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your generated reports will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
