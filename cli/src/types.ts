export interface DiffChunk {
  file_path: string;
  chunk_index: number;
  content: string;
}

export interface ReviewRequest {
  diff_chunks: DiffChunk[];
  agents: string[];
}

export interface Finding {
  agent: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  file_path: string;
  line: number;
  title: string;
  description: string;
  suggestion: string;
}

export interface FindingCounts {
  high: number;
  medium: number;
  low: number;
}

export interface ReviewResponse {
  review_id: string;
  tech_debt_score: number;
  finding_counts: FindingCounts;
  findings: Finding[];
}
