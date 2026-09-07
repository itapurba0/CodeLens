import type { MetricsSummary, ReviewHistoryEntry } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchSummary(): Promise<MetricsSummary> {
  const res = await fetch(`${API_BASE}/metrics/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch summary: ${res.status}`);
  return res.json();
}

export async function fetchHistory(days: number = 30): Promise<ReviewHistoryEntry[]> {
  const res = await fetch(`${API_BASE}/metrics/history?days=${days}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
  const data = await res.json();
  return data.reviews;
}
