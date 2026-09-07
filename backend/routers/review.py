import asyncio
import uuid

from fastapi import APIRouter

from agents import AGENT_MAP
from db.supabase import get_reviews, get_summary, log_review
from schemas.review import (
    MetricsSummary,
    ReviewHistoryEntry,
    ReviewHistoryResponse,
    FindingCounts,
    FindingSeverity,
    ReviewRequest,
    ReviewResponse,
)

router = APIRouter()


def _compute_score(finding_counts: FindingCounts) -> int:
    deductions = 0
    deductions += min(finding_counts.high * 10, 50)
    deductions += min(finding_counts.medium * 5, 30)
    deductions += min(finding_counts.low * 2, 20)
    return max(0, min(100, 100 - deductions))


@router.post("/review")
async def create_review(body: ReviewRequest) -> ReviewResponse:
    review_id = str(uuid.uuid4())
    agent_classes = [AGENT_MAP[name] for name in body.agents if name in AGENT_MAP]

    tasks = [cls().run(body.diff_chunks) for cls in agent_classes]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    all_findings = []
    for result in results:
        if isinstance(result, list):
            all_findings.extend(result)

    counts = FindingCounts()
    for f in all_findings:
        if f.severity == FindingSeverity.HIGH:
            counts.high += 1
        elif f.severity == FindingSeverity.MEDIUM:
            counts.medium += 1
        elif f.severity == FindingSeverity.LOW:
            counts.low += 1

    score = _compute_score(counts)

    await log_review(
        review_id=review_id,
        tech_debt_score=score,
        finding_counts={"high": counts.high, "medium": counts.medium, "low": counts.low},
    )

    return ReviewResponse(
        review_id=review_id,
        tech_debt_score=score,
        finding_counts=counts,
        findings=all_findings,
    )


@router.get("/metrics/summary")
async def metrics_summary() -> MetricsSummary:
    data = await get_summary()
    return MetricsSummary(**data)


@router.get("/metrics/history")
async def metrics_history(days: int = 30) -> ReviewHistoryResponse:
    reviews = await get_reviews(days=days)
    entries = [
        ReviewHistoryEntry(
            review_id=r["id"],
            timestamp=r["created_at"],
            tech_debt_score=r["tech_debt_score"],
            finding_counts=FindingCounts(**r["finding_counts"]),
        )
        for r in reviews
    ]
    return ReviewHistoryResponse(reviews=entries)
