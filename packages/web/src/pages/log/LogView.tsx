import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function LogView() {
  const { date } = useParams<{ date: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log for {date}</h1>
        <p className="text-muted-foreground">View or edit this day's health log.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{date}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Daily entry details for {date} will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
