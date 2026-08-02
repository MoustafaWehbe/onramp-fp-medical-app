export interface MoodTrendPoint {
  date: string;
  value: number | null;
}

export interface SleepTrendPoint {
  date: string;
  hours: number | null;
}

export interface SymptomFrequency {
  symptom: string;
  count: number;
}

export interface AnalyticsDashboard {
  period: number;
  moodTrend: MoodTrendPoint[];
  sleepTrend: SleepTrendPoint[];
  symptomFrequency: SymptomFrequency[];
}

export interface AnalyticsDashboardParams {
  days?: number;
}