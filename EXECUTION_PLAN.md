# CodeLens — Execution Plan

## Repository Conventions

- **Language:** TypeScript for CLI and Frontend; Python 3.11+ for Backend
- **Package manager:** npm (CLI, Frontend); pip + venv (Backend)
- **Structure:** Three independent packages — no monorepo workspace
- **Backend deps format:** `requirements.txt`

---

## 1. Folder & File Structure

### CLI (`cli/`)

```
cli/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # shebang + commander entrypoint
│   ├── commands/
│   │   └── review.ts         # `codelens review` handler
│   ├── git.ts                # spawn `git diff HEAD -U3`, chunk + line-number
│   └── api.ts                # HTTP POST to backend
├── bin/
│   └── codelens.js           # compiled bin entrypoint (from src/index.ts)
└── tests/
    └── review.test.ts
```

### Backend (`backend/`)

```
backend/
├── requirements.txt
├── main.py                   # FastAPI app factory + startup
├── routers/
│   └── review.py             # POST /api/review
├── schemas/
│   └── review.py             # Pydantic v2 request/response models
├── agents/
│   ├── base.py               # Abstract agent interface
│   ├── syntax_bug.py         # Syntax & bug detection
│   ├── security.py           # Security scanning
│   ├── performance.py        # Performance optimization
│   └── style.py              # Style & readability
├── services/
│   └── ai_client.py          # OpenAI-compatible chat client (env-driven)
├── db/
│   └── supabase.py           # Telemetry logging to Supabase
├── tests/
│   ├── test_review.py
│   └── test_agents.py
└── .env.example
```

### Frontend (`frontend/`)

```
frontend/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Dashboard: score + trend + audit
│   │   └── globals.css
│   ├── components/
│   │   ├── TechDebtScore.tsx  # 0–100 gauge
│   │   ├── TrendChart.tsx     # Time-series chart
│   │   └── AuditLog.tsx       # Searchable history table
│   ├── lib/
│   │   └── api.ts             # Client to backend metrics endpoints
│   └── types/
│       └── index.ts           # Shared TypeScript types
```

---

## 2. Dependencies

### CLI (`cli/package.json`)

```jsonc
{
  "dependencies": {
    "commander": "^12",
    "execa": "^9",
    "ora": "^8"                   // loading spinner
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^22",
    "tsx": "^4",                  // run TS directly in dev
    "vitest": "^2"
  }
}
```

### Backend (`backend/requirements.txt`)

```
fastapi>=0.115
pydantic>=2.0
httpx>=0.28
supabase>=2.0
uvicorn[standard]>=0.32
pytest>=8
pytest-asyncio>=0.24
ruff>=0.7
```

### Frontend (`frontend/package.json`)
Scaffolded via `npx create-next-app@latest frontend --ts --tailwind --app --src-dir`, then add:

```jsonc
{
  "dependencies": {
    "recharts": "^2",
    "lucide-react": "^0.460"      // icons (optional)
  }
}
```

---

## 3. Phased Build Sequence

### Phase 1 — Backend API & Pydantic Schemas
- [ ] Scaffold `backend/` directory structure
- [ ] Create `requirements.txt` with all dependencies
- [ ] Create virtual environment, install deps
- [ ] Define Pydantic models in `schemas/review.py`:
  - `DiffChunk` (file_path, chunk_index, content)
  - `ReviewRequest` (diff_chunks: list[DiffChunk], agents: list[str])
  - `Finding` (agent, severity, file_path, line, title, description, suggestion)
  - `ReviewResponse` (review_id, tech_debt_score, finding_counts, findings)
  - `MetricsSummary` (total_reviews, current_score, score_trend, week_delta)
  - `ReviewHistoryEntry` (review_id, timestamp, tech_debt_score, finding_counts)
- [ ] Create `main.py` — FastAPI app with CORS
- [ ] Create `routers/review.py`:
  - `POST /api/review` — returns placeholder `ReviewResponse`
  - `GET /api/metrics/summary` — returns placeholder `MetricsSummary`
  - `GET /api/metrics/history?days=30` — returns placeholder list of entries
- [ ] Add `uvicorn main:app --reload` startup script
- [ ] Write smoke tests with `pytest` + `httpx.AsyncClient`

### Phase 2 — CLI Git Integration
- [ ] Scaffold `cli/` directory, `package.json`, `tsconfig.json`
- [ ] Create `src/index.ts`:
  - shebang `#!/usr/bin/env node`
  - Commander program with `review` command
- [ ] Create `src/git.ts`:
  - `spawnDiff()` — execa `git diff HEAD -U3`
  - `chunkDiff(raw: string)` — split into per-file chunks
  - `prefixLines(content: string)` — add absolute line numbers
- [ ] Create `src/api.ts`:
  - `postReview(diffChunks)` — POST to `http://localhost:8000/api/review`
  - handle errors, timeouts
- [ ] Wire `review` command: diff → chunk → prefix → POST → render
- [ ] Create `src/commands/review.ts` with terminal renderer (spinner via `ora`, markdown output via `console.log`)
- [ ] Configure bin entrypoint in `package.json`: `"bin": { "codelens": "./bin/codelens.js" }`
- [ ] Write vitest tests for `git.ts` and `api.ts`

### Phase 3 — AI Prompt Orchestration
- [ ] Create `services/ai_client.py`:
  - Read `OPENAI_BASE_URL` and `OPENAI_API_KEY` from env
  - `chat(messages, model)` → returns parsed JSON
  - Use `httpx.AsyncClient` for non-blocking HTTP
- [ ] Create `agents/base.py`:
  - Abstract `Agent` class with `name: str`, `system_prompt: str`, `run(diff_chunks) -> list[Finding]`
- [ ] Create agents (`syntax_bug.py`, `security.py`, `performance.py`, `style.py`):
  - Each has a tailored system prompt
  - Each calls `ai_client.chat()` and parses findings
- [ ] Wire into `routers/review.py`:
  - `asyncio.gather(*[agent.run(diff) for agent in selected_agents])`
  - Aggregate findings, compute `tech_debt_score`
  - Return `ReviewResponse`
- [ ] Create `db/supabase.py`:
  - `log_review(review_id, score, finding_counts)` — inserts into `reviews` table
  - Called after successful review (no code storage)
- [ ] Create `.env.example` with `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`
- [ ] Write tests with mocked AI client

### Phase 4 — Next.js Analytics Dashboard
- [ ] Scaffold Frontend via: `npx create-next-app@latest frontend --ts --tailwind --app --src-dir --no-import-alias`
- [ ] Add `recharts` dependency
- [ ] Create `src/types/index.ts` — mirror backend response types
- [ ] Create `src/lib/api.ts` — fetch wrappers for `/api/metrics/summary` and `/api/metrics/history`
- [ ] Create `src/components/TechDebtScore.tsx`:
  - Accept `score: number`
  - Ring/gauge visualization using SVG or a small lib
  - Color coding: green (>=80), yellow (50–79), red (<50)
- [ ] Create `src/components/TrendChart.tsx`:
  - Accept `reviews: ReviewHistoryEntry[]`
  - `recharts` `LineChart` with score over time
  - Day/week/month toggle
- [ ] Create `src/components/AuditLog.tsx`:
  - Accept `reviews: ReviewHistoryEntry[]`
  - Sortable columns (date, score, finding counts)
  - Search/filter by date range
- [ ] Wire `src/app/page.tsx` — compose dashboard layout from components
- [ ] Style with Tailwind CSS, responsive layout
- [ ] Connect to live backend, run end-to-end flow

---

## 4. API Contracts

### POST /api/review — CLI → Backend

```jsonc
// Request
{
  "diff_chunks": [
    {
      "file_path": "src/foo.ts",
      "chunk_index": 0,
      "content": " 1: import { bar } from './bar';\n 2: \n 3: export function foo() {"
    }
  ],
  "agents": ["syntax", "security", "performance", "style"]
}

// Response (200)
{
  "review_id": "550e8400-e29b-41d4-a716-446655440000",
  "tech_debt_score": 72,
  "finding_counts": { "high": 2, "medium": 5, "low": 5 },
  "findings": [
    {
      "agent": "security",
      "severity": "HIGH",
      "file_path": "src/foo.ts",
      "line": 15,
      "title": "Hardcoded API key",
      "description": "Literal API key found in source code",
      "suggestion": "Move to environment variable"
    }
  ]
}
```

### GET /api/metrics/summary — Frontend → Backend

```jsonc
// Response (200)
{
  "total_reviews": 42,
  "current_score": 72,
  "score_trend": "improving",
  "week_delta": -3
}
```

### GET /api/metrics/history?days=30 — Frontend → Backend

```jsonc
// Response (200)
{
  "reviews": [
    {
      "review_id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2026-06-15T10:30:00Z",
      "tech_debt_score": 72,
      "finding_counts": { "high": 2, "medium": 5, "low": 5 }
    }
  ]
}
```

---

## 5. Supabase Schema

```sql
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  tech_debt_score INTEGER NOT NULL,
  finding_counts  JSONB NOT NULL,
  summary     TEXT
);

-- No code content stored per data-privacy requirement
```

---

## 6. Scoring Logic

```
tech_debt_score = 100 - total_deductions
deductions:
  - HIGH severity finding:   -10 points (max -50)
  - MEDIUM severity finding:  -5 points (max -30)
  - LOW severity finding:     -2 points (max -20)
score = max(0, min(100, score))
```
