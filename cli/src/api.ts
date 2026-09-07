import type { ReviewRequest, ReviewResponse } from "./types.js";

const DEFAULT_URL = "http://localhost:8000/api/review";

export async function postReview(
  request: ReviewRequest,
  backendUrl: string = DEFAULT_URL,
  timeoutMs: number = 30000
): Promise<ReviewResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Backend returned ${resp.status}: ${body}`);
    }

    return (await resp.json()) as ReviewResponse;
  } finally {
    clearTimeout(timer);
  }
}
