from enum import Enum

from pydantic import BaseModel


class FindingSeverity(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class DiffChunk(BaseModel):
    file_path: str
    chunk_index: int
    content: str


class ReviewRequest(BaseModel):
    diff_chunks: list[DiffChunk]
    agents: list[str] = ["syntax", "security", "performance", "style"]


class Finding(BaseModel):
    agent: str
    severity: FindingSeverity
    file_path: str
    line: int
    title: str
    description: str
    suggestion: str


class FindingCounts(BaseModel):
    high: int = 0
    medium: int = 0
    low: int = 0


class ReviewResponse(BaseModel):
    review_id: str
    tech_debt_score: int
    finding_counts: FindingCounts
    findings: list[Finding]


class MetricsSummary(BaseModel):
    total_reviews: int
    current_score: int
    score_trend: str
    week_delta: int


class ReviewHistoryEntry(BaseModel):
    review_id: str
    timestamp: str
    tech_debt_score: int
    finding_counts: FindingCounts


class ReviewHistoryResponse(BaseModel):
    reviews: list[ReviewHistoryEntry]
