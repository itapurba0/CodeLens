"use client";

import { useEffect, useState } from "react";
import { TechDebtScore } from "@/components/TechDebtScore";
import { TrendChart } from "@/components/TrendChart";
import { AuditLog } from "@/components/AuditLog";
import { fetchSummary, fetchHistory } from "@/lib/api";
import type { MetricsSummary, ReviewHistoryEntry } from "@/types";

export default function Dashboard() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [history, setHistory] = useState<ReviewHistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, h] = await Promise.all([fetchSummary(), fetchHistory()]);
        setSummary(s);
        setHistory(h);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Connection Error
          </h1>
          <p className="text-gray-500">{error}</p>
          <p className="text-gray-400 text-sm mt-2">
            Make sure the backend is running on localhost:8000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">
          CodeLens Dashboard
        </h1>
        <p className="text-sm text-gray-500">Code health analytics</p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm flex items-center justify-center">
            {summary ? (
              <TechDebtScore score={summary.current_score} />
            ) : (
              <div className="h-40 w-40 bg-gray-100 rounded-full animate-pulse" />
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm md:col-span-3">
            <h2 className="text-sm font-medium text-gray-500 mb-4">
              Score Trend
            </h2>
            <TrendChart reviews={history} />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500 mb-1">
              Total Reviews
            </h2>
            <p className="text-3xl font-bold text-gray-900">
              {summary?.total_reviews ?? "—"}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500 mb-1">
              Week Delta
            </h2>
            <p
              className={`text-3xl font-bold ${
                (summary?.week_delta ?? 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {summary ? (summary.week_delta >= 0 ? "+" : "") + summary.week_delta : "—"}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Trend</h2>
            <p className="text-3xl font-bold text-gray-900 capitalize">
              {summary?.score_trend ?? "—"}
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 mb-4">
            Audit History
          </h2>
          <AuditLog reviews={history} />
        </section>
      </main>
    </div>
  );
}
