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
    value: item.value,
  }));

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-lift sm:p-5">
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
        <div className="h-[260px] w-full sm:h-[300px]" role="img" aria-label="Line chart showing mood ratings over time">
          <p className="sr-only">
            {chartData
              .map((item) => `On ${item.date}, mood rating ${item.value}.`)
              .join(" ")}
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                domain={[0, 5]}
                allowDecimals={false}
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
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
