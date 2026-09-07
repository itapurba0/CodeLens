import os
from typing import Any

from supabase import create_client, Client

_client: Client | None = None


def _get_client() -> Client | None:
    global _client
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "")
    if not url or not key:
        return None
    if _client is None:
        _client = create_client(url, key)
    return _client


async def log_review(
    review_id: str,
    tech_debt_score: int,
    finding_counts: dict[str, int],
    summary: str = "",
) -> None:
    client = _get_client()
    if client is None:
        return
    client.table("reviews").insert({
        "id": review_id,
        "tech_debt_score": tech_debt_score,
        "finding_counts": finding_counts,
        "summary": summary,
    }).execute()


async def get_reviews(days: int = 30) -> list[dict[str, Any]]:
    client = _get_client()
    if client is None:
        return []
    resp = (
        client.table("reviews")
        .select("*")
        .order("created_at", desc=True)
        .limit(100)
        .execute()
    )
    return resp.data or []


async def get_summary() -> dict[str, Any]:
    reviews = await get_reviews(days=7)
    if not reviews:
        return {"total_reviews": 0, "current_score": 100, "score_trend": "stable", "week_delta": 0}

    total = len(reviews)
    current_score = reviews[0]["tech_debt_score"]
    older = reviews[-1]["tech_debt_score"] if len(reviews) > 1 else current_score
    delta = current_score - older
    trend = "improving" if delta > 0 else "declining" if delta < 0 else "stable"

    return {
        "total_reviews": total,
        "current_score": current_score,
        "score_trend": trend,
        "week_delta": delta,
    }
