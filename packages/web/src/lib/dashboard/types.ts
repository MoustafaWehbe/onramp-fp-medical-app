export interface DashboardStats {
  entryCount: number;
  activeMedicationCount: number;
  activeConditionCount: number;
  avgMood: number | null;
}

export interface RecentEntryItem {
  id: string;
  entryDate: string;
  moodRating: number | null;
  sleepHours: number | null;
  journalSnippet: string | null;
}

export interface LastVisitItem {
  date: string;
  doctorName: string;
  clinicName: string | null;
  summary: string | null;
}

export interface DashboardData {
  stats: DashboardStats;
  recentEntries: RecentEntryItem[];
  lastVisit: LastVisitItem | null;
}
