import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SleepTrendPoint } from "../../lib/analytics/types";

interface SleepChartProps {
  data: SleepTrendPoint[];
}

export function SleepChart({ data }: SleepChartProps) {
  const chartData = data.map((item) => ({
    date: item.date,
    hours: item.hours,
  }));

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
      <div className="mb-4">
        <h3 className="font-semibold">
          Sleep Trend
        </h3>

        <p className="text-sm text-muted-foreground">
          Your sleep duration over time
        </p>
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sleep data available.
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
                domain={[0, "auto"]}
                tickFormatter={(value) =>
                  `${value}h`
                }
              />

              <Tooltip
                 contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{
                  color: "hsl(var(--foreground))",
                }}
                itemStyle={{
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value) =>
                  `${value} hours`
                }
              />

              <Line
                type="monotone"
                dataKey="hours"
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