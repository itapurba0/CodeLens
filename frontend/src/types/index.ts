export interface FindingCounts {
  high: number;
  medium: number;
  low: number;
}

export interface ReviewHistoryEntry {
  review_id: string;
  timestamp: string;
  tech_debt_score: number;
  finding_counts: FindingCounts;
}

export interface MetricsSummary {
  total_reviews: number;
  current_score: number;
  score_trend: string;
  week_delta: number;
}
