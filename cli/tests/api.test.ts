import { describe, it, expect, vi, beforeEach } from "vitest";
import { postReview } from "../src/api.js";

describe("postReview", () => {
  const mockFetch = vi.fn();
  vi.stubGlobal("fetch", mockFetch);

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("sends POST request and returns response", async () => {
    const mockResponse = {
      review_id: "test-123",
      tech_debt_score: 90,
      finding_counts: { high: 0, medium: 1, low: 0 },
      findings: [],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await postReview({
      diff_chunks: [{ file_path: "a.ts", chunk_index: 0, content: "line" }],
      agents: ["syntax"],
    });

    expect(result.review_id).toBe("test-123");
    expect(result.tech_debt_score).toBe(90);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("error"),
    });

    await expect(
      postReview({
        diff_chunks: [{ file_path: "a.ts", chunk_index: 0, content: "line" }],
        agents: ["syntax"],
      })
    ).rejects.toThrow("Backend returned 500");
  });
});
