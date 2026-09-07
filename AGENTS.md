# CodeLens — Agent Guide

Greenfield project, currently only `prd.md` exists. Three packages to build:

## Packages

| Directory | Tech | Entrypoint |
|-----------|------|------------|
| `cli/` | Node.js, commander.js, execa | Bin script in `cli/package.json` |
| `backend/` | FastAPI (Python 3.11+), Pydantic v2, asyncio | `backend/main.py` |
| `frontend/` | Next.js 15 (App Router), Tailwind CSS, TypeScript | `frontend/` (standard Next layout) |

## Key constraints from PRD

- **Database:** Supabase (PostgreSQL) — only for telemetry, never store code snippets.
- **AI provider:** DeepSeek V4 Flash via OpenAI-compatible env vars (`OPENAI_BASE_URL`, `OPENAI_API_KEY`). Must support 256k+ token context. Free tiers required.
- **Parallel execution:** Backend must run all agents concurrently via `asyncio.gather()`.
- **Latency target:** <4s for <500 line diffs.
- **CLI command:** `codelens review` — spawns `git diff HEAD -U3`, line-number-prefixes chunks, POSTs JSON to backend.
- **Frontend:** Tech debt score (0–100), trend charts, historical audit log.

## Commands

### Backend (Python)

```powershell
cd backend
.\venv\Scripts\Activate.ps1          # activate venv
uvicorn main:app --reload             # start dev server on :8000
pytest tests/ -v                      # run all backend tests
ruff check .                          # lint
```

### CLI (Node.js) — coming in Phase 2

### Frontend (Next.js) — coming in Phase 4

## Verifying

Before committing: run `pytest tests/ -v` for backend changes, `npx vitest run` for CLI, or `npm test` for frontend. Run lint (`ruff check .` backend, `npx tsc --noEmit` CLI/frontend) before pushing.
