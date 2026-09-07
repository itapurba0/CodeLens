from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
@patch("agents.base.chat", new_callable=AsyncMock, return_value=[])
async def test_create_review_returns_empty_findings(mock_chat, client: AsyncClient):
    payload = {
        "diff_chunks": [
            {"file_path": "src/test.ts", "chunk_index": 0, "content": " 1: const x = 1;\n"}
        ],
        "agents": ["syntax"],
    }
    resp = await client.post("/api/review", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "review_id" in data
    assert data["tech_debt_score"] == 100
    assert data["finding_counts"] == {"high": 0, "medium": 0, "low": 0}
    assert data["findings"] == []


@pytest.mark.asyncio
@patch("agents.base.chat", new_callable=AsyncMock)
async def test_create_review_with_findings(mock_chat, client: AsyncClient):
    mock_chat.return_value = [
        {
            "severity": "HIGH",
            "file_path": "src/test.ts",
            "line": 1,
            "title": "Hardcoded secret",
            "description": "API key in source",
            "suggestion": "Use env var",
        }
    ]
    payload = {
        "diff_chunks": [
            {"file_path": "src/test.ts", "chunk_index": 0, "content": " 1: const x = 1;\n"}
        ],
        "agents": ["security"],
    }
    resp = await client.post("/api/review", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["tech_debt_score"] == 90
    assert data["finding_counts"]["high"] == 1
    assert len(data["findings"]) == 1
    assert data["findings"][0]["agent"] == "security"


@pytest.mark.asyncio
async def test_review_rejects_invalid_payload(client: AsyncClient):
    resp = await client.post("/api/review", json={})
    assert resp.status_code == 422


@pytest.mark.asyncio
@patch("routers.review.get_summary", new_callable=AsyncMock)
async def test_metrics_summary(mock_summary, client: AsyncClient):
    mock_summary.return_value = {
        "total_reviews": 5,
        "current_score": 85,
        "score_trend": "improving",
        "week_delta": 3,
    }
    resp = await client.get("/api/metrics/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_reviews"] == 5
    assert data["current_score"] == 85


@pytest.mark.asyncio
@patch("routers.review.get_reviews", new_callable=AsyncMock)
async def test_metrics_history(mock_reviews, client: AsyncClient):
    mock_reviews.return_value = []
    resp = await client.get("/api/metrics/history?days=30")
    assert resp.status_code == 200
    data = resp.json()
    assert data["reviews"] == []
