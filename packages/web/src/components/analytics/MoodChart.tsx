import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MoodTrendPoint } from "../../lib/analytics/types";

interface MoodChartProps {
  data: MoodTrendPoint[];
}

export function MoodChart({ data }: MoodChartProps) {
  const chartData = data.map((item) => ({
    date: item.date,
    value: item.value ?? 0,
  }));

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition-all  hover:border-primary/40 hover:shadow-md">
      <div className="mb-4">
        <h3 className="font-semibold">
          Mood Trend
        </h3>
        <p className="text-sm text-muted-foreground">
          Your mood changes over time
        </p>
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No mood data available.
        </p>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                domain={[0, 5]}
                allowDecimals={false}
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="value"
                stroke="currentColor"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}