import json
import os
from typing import Any

import httpx


async def chat(messages: list[dict[str, str]], model: str = "deepseek-chat") -> Any:
    base_url = os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com/v1")
    api_key = os.environ.get("OPENAI_API_KEY", "")

    url = f"{base_url.rstrip('/')}/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {"model": model, "messages": messages, "temperature": 0.2}

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()

    content = resp.json()["choices"][0]["message"]["content"]

    if "```json" in content:
        content = content.split("```json", 1)[1].split("```", 1)[0]
    elif "```" in content:
        content = content.split("```", 1)[1].split("```", 1)[0]

    return json.loads(content.strip())
