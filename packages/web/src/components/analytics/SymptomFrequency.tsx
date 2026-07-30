import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SymptomFrequency as SymptomFrequencyType } from "../../lib/analytics/types";

interface SymptomFrequencyProps {
  data: SymptomFrequencyType[];
}

export function SymptomFrequency({
  data,
}: SymptomFrequencyProps) {
  const chartData = data.map((item) => ({
    symptom: item.symptom,
    count: item.count,
  }));

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm shadow-sm transition-all  hover:border-primary/40 hover:shadow-md">
      <div className="mb-4">
        <h3 className="font-semibold">
          Symptom Frequency
        </h3>

        <p className="text-sm text-muted-foreground">
          Most common symptoms recorded
        </p>
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No symptom data available.
        </p>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="symptom"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={70}
              />

              <YAxis
                allowDecimals={false}
              />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="currentColor"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}