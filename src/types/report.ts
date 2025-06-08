export interface DailyReportItem {
  date: string;
  count: number;
}

export interface MonthlyReportItem {
  month: string;
  count: number;
}

export interface YearlyReportItem {
  year: string;
  count: number;
}

export interface ReportData {
  daily: DailyReportItem[];
  monthly: MonthlyReportItem[];
  yearly: YearlyReportItem[];
  eventDistribution: { eventName: string; count: number }[];
  topEvents: { eventName: string; attendees: number }[];
}
