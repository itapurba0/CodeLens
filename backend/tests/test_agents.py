import pytest

from agents.performance import PerformanceAgent
from agents.security import SecurityAgent
from agents.style import StyleAgent
from agents.syntax_bug import SyntaxBugAgent
from schemas.review import DiffChunk, FindingSeverity


@pytest.fixture
def chunks():
    return [DiffChunk(file_path="src/test.ts", chunk_index=0, content=" 1: const x = 1;\n")]


@pytest.mark.asyncio
async def test_syntax_agent_parse_valid(chunks):
    agent = SyntaxBugAgent()
    data = [
        {
            "severity": "MEDIUM",
            "file_path": "src/test.ts",
            "line": 1,
            "title": "Null risk",
            "description": "x may be null",
            "suggestion": "Add null check",
        }
    ]
    findings = agent._parse_findings(data, chunks)
    assert len(findings) == 1
    assert findings[0].agent == "syntax"
    assert findings[0].severity == FindingSeverity.MEDIUM


@pytest.mark.asyncio
async def test_security_agent_parse_invalid(chunks):
    agent = SecurityAgent()
    findings = agent._parse_findings({"bad": "data"}, chunks)
    assert findings == []


@pytest.mark.asyncio
async def test_performance_agent_parse_empty(chunks):
    agent = PerformanceAgent()
    findings = agent._parse_findings([], chunks)
    assert findings == []


@pytest.mark.asyncio
async def test_style_agent_parse_valid(chunks):
    agent = StyleAgent()
    data = [
        {
            "severity": "LOW",
            "file_path": "src/test.ts",
            "line": 1,
            "title": "Missing docs",
            "description": "No JSDoc",
            "suggestion": "Add comments",
        }
    ]
    findings = agent._parse_findings(data, chunks)
    assert len(findings) == 1
    assert findings[0].agent == "style"
