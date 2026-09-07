import os
from abc import ABC, abstractmethod
from typing import Any

from schemas.review import DiffChunk, Finding
from services.ai_client import chat


class Agent(ABC):
    name: str
    system_prompt: str

    @abstractmethod
    def _parse_findings(self, data: Any, chunks: list[DiffChunk]) -> list[Finding]:
        ...

    async def run(self, chunks: list[DiffChunk]) -> list[Finding]:
        diff_text = "\n\n".join(
            f"--- {c.file_path} (chunk {c.chunk_index}) ---\n{c.content}"
            for c in chunks
        )

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": diff_text},
        ]

        model = os.environ.get("OPENAI_MODEL", "deepseek-chat")
        try:
            data = await chat(messages, model=model)
            return self._parse_findings(data, chunks)
        except Exception:
            return []
