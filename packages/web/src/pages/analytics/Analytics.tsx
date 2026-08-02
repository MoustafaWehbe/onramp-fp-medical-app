import { AnalyticsDashboard } from "../../components/analytics/AnalyticsDashboard";
import { AnalyticsProvider } from "../../providers/AnalyticsProvider";

export function Analytics() {
  return (
    <AnalyticsProvider>
      <AnalyticsDashboard />
    </AnalyticsProvider>
  );
}