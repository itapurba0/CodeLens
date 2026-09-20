```md
# CodeLens

Local-first AI code review from your terminal.

CodeLens analyzes your current Git diff with multiple specialized AI agents, then reports actionable findings for bugs, security risks, performance problems, and code quality issues. A lightweight dashboard tracks technical debt and review history over time.

## Features

- Run reviews directly from the terminal
- Analyze Git changes with line-numbered diff context
- Parallel AI review agents:
  - Syntax and bug detection
  - Security scanning
  - Performance analysis
  - Style and readability
- Severity-based findings: `HIGH`, `MEDIUM`, and `LOW`
- Technical Debt Score from `0` to `100`
- Optional Supabase persistence for review metrics
- Next.js dashboard for trends and audit history
- OpenAI-compatible provider configuration

## Architecture

```text
Developer
   |
   v
CodeLens CLI
   |
   | POST /api/review
   v
FastAPI Backend
   |
   +--> Syntax and Bug Agent
   +--> Security Agent
   +--> Performance Agent
   +--> Style Agent
   |
   v
Review Results + Metrics
   |
   +--> Terminal output
   +--> Supabase telemetry
   +--> Web dashboard
```

## Project Structure

```text
.
├── backend/       # FastAPI API and AI review agents
├── cli/           # Node.js command-line client
├── frontend/      # Next.js metrics dashboard
```

## Requirements

- Python 3.11+
- Node.js 20+
- npm
- Git
- An OpenAI-compatible API key
- Optional: Supabase project for persistent metrics

## Quick Start

### 1. Start the backend

```powershell
cd backend

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r `requirements.txt`
```

Create `backend/.env`:

```env
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_API_KEY=your_api_key

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key
```

Start the API:

```powershell
uvicorn main:app --reload
```

The backend runs at:

```text
http://localhost:8000
```

API documentation is available at:

```text
http://localhost:8000/docs
```

### 2. Install and build the CLI

```powershell
cd cli
npm install
npm run build
```

Run the CLI during development:

```powershell
npm run dev -- review
```

Run a review from the compiled CLI:

```powershell
node bin/codelens.js review
```

The CLI reviews the current `git diff HEAD` and sends it to the local backend.

### 3. Start the dashboard

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## CLI Usage

Run all review agents:

```powershell
codelens review
```

Run selected agents:

```powershell
codelens review --agents security,performance
```

Use a different backend URL:

```powershell
codelens review --backend http://localhost:8000/api/review
```

Available agents:

```text
syntax
security
performance
style
```

## API

### `POST /api/review`

Runs a review against supplied diff chunks.

```json
{
  "diff_chunks": [
    {
      "file_path": "src/example.ts",
      "chunk_index": 0,
      "content": " 15: const token = process.env.API_KEY;"
    }
  ],
  "agents": ["syntax", "security", "performance", "style"]
}
```

### `GET /api/metrics/summary`

Returns aggregate review statistics and the current technical debt score.

### `GET /api/metrics/history?days=30`

Returns historical review scores and finding counts.

## Technical Debt Score

The score starts at `100` and decreases according to finding severity:

- High severity: up to 10 points per finding
- Medium severity: up to 5 points per finding
- Low severity: up to 2 points per finding

The final score is always between `0` and `100`.

## Development

Run backend tests:

```powershell
cd backend
pytest tests/ -v
```

Run backend linting:

```powershell
ruff check .
```

Run CLI tests:

```powershell
cd cli
npm test
```

Run CLI type checking:

```powershell
npm run lint
```

Run frontend linting:

```powershell
cd frontend
npm run lint
```

## Privacy

CodeLens is designed to avoid persisting source code. Diff contents are sent to the configured AI provider for analysis and are kept in backend memory during the review process.

Supabase stores review telemetry such as:

- Review ID
- Technical debt score
- Finding counts
- Review timestamp

Source code snippets are not stored in the review metrics database.

## Project Status

CodeLens is under active development. The core CLI-to-backend review flow, concurrent agent execution, scoring, and metrics endpoints are implemented. The dashboard and provider integrations continue to evolve.


This version avoids claiming that untracked files are included, since the current CLI uses `git diff HEAD`, which only captures Git-tracked changes.
