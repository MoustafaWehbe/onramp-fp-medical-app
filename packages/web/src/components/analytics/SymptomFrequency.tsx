import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import type { SymptomFrequency as SymptomFrequencyType } from "../../lib/analytics/types";

interface SymptomFrequencyProps {
  data: SymptomFrequencyType[];
}

export function SymptomFrequency({
  data,
}: SymptomFrequencyProps) {
  const { t } = useTranslation();
  const chartData = data.map((item) => ({
    symptom: item.symptom,
    count: item.count,
  }));

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-lift sm:p-5">
      <div className="mb-4">
        <h3 className="font-semibold">
          {t("analytics.symptomFrequency")}
        </h3>

        <p className="text-sm text-muted-foreground">
          {t("analytics.symptomFrequencyDescription")}
        </p>
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("analytics.noSymptomData")}
        </p>
      ) : (
        <div className="h-[280px] w-full sm:h-[320px]" role="img" aria-label={t("analytics.symptomFrequency")}>
          <p className="sr-only">
            {chartData
              .map((item) => `${item.symptom}: ${item.count} ${item.count === 1 ? "record" : "records"}.`)
              .join(" ")}
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />

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
              cursor={{ fill: "transparent" }}/>

              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
