from typing import Any

from agents.base import Agent
from schemas.review import DiffChunk, Finding, FindingSeverity


class SecurityAgent(Agent):
    name = "security"
    system_prompt = """You are a security scanning agent. Analyze the provided code diff and identify:
- Hardcoded secrets, API keys, tokens, passwords
- OWASP Top 10 vulnerabilities (injection, XSS, CSRF, etc.)
- SQL injection risks
- Path traversal vulnerabilities
- Weak cryptography usage
- Insecure deserialization
- Missing input validation

Return a JSON array of findings. Each finding must have:
- "severity": "HIGH" or "MEDIUM"
- "file_path": the file path from the diff
- "line": the absolute line number (from the diff's line prefix)
- "title": short title
- "description": detailed description
- "suggestion": fix suggestion

Return ONLY the JSON array, no other text. If no issues found, return an empty array []."""

    def _parse_findings(self, data: Any, chunks: list[DiffChunk]) -> list[Finding]:
        if not isinstance(data, list):
            return []
        findings = []
        for item in data:
            try:
                findings.append(Finding(
                    agent=self.name,
                    severity=FindingSeverity(item["severity"]),
                    file_path=item["file_path"],
                    line=int(item["line"]),
                    title=item["title"],
                    description=item["description"],
                    suggestion=item["suggestion"],
                ))
            except (KeyError, ValueError):
                continue
        return findings
