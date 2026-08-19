export interface AiReportContent {
  summary?: string;
  conditions?: string[];
  medications?: string[];
  symptoms?: string[];
  recommendations?: string[];
  reportType?: string;
  [key: string]: unknown;
}

export interface AiReport {
  id: string;
  userId: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  reportContent: AiReportContent;
  createdAt: string;
  updatedAt: string;
}

export interface AiReportsQuery {
  currentPage?: number;
  pageSize?: number;
}

export interface GenerateAiReportRequest {
  startDate: string;
  endDate: string;
  reportType: string;
  language?: "en" | "ar";
}
