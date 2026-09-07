"use client";

import { useMemo, useState } from "react";
import type { ReviewHistoryEntry } from "@/types";

interface AuditLogProps {
  reviews: ReviewHistoryEntry[];
}

export function AuditLog({ reviews }: AuditLogProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return reviews;
    const q = search.toLowerCase();
    return reviews.filter(
      (r) =>
        r.review_id.toLowerCase().includes(q) ||
        r.timestamp.toLowerCase().includes(q)
    );
  }, [reviews, search]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search by ID or date..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          No reviews found
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Score</th>
                <th className="pb-2 font-medium">High</th>
                <th className="pb-2 font-medium">Medium</th>
                <th className="pb-2 font-medium">Low</th>
                <th className="pb-2 font-medium">Review ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.review_id} className="border-b border-gray-100">
                  <td className="py-2">
                    {new Date(r.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2">
                    <span
                      className={`font-semibold ${
                        r.tech_debt_score >= 80
                          ? "text-green-600"
                          : r.tech_debt_score >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {r.tech_debt_score}
                    </span>
                  </td>
                  <td className="py-2 text-red-600">{r.finding_counts.high}</td>
                  <td className="py-2 text-yellow-600">
                    {r.finding_counts.medium}
                  </td>
                  <td className="py-2 text-blue-600">{r.finding_counts.low}</td>
                  <td className="py-2 text-gray-400 font-mono text-xs">
                    {r.review_id.slice(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
