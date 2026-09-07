# Product Requirement Document (PRD): CodeLens

## 1. Executive Summary & Vision 

CodeLens is an open-source, local-first CLI code review agent paired with a lightweight web metrics dashboard. It allows developers to run deep, multi-agent AI reviews on their uncommitted `git diff` branches directly from the terminal before opening a pull request. By using free cloud-hosted models, CodeLens removes the CPU/RAM hardware requirements of running local LLMs while avoiding expensive enterprise platform costs.

---

## 2. Core Problem & Value Proposition

* **The Problem:** Developers often discover syntax edge-cases, security oversights (like leaked API tokens), and performance bottlenecks (like N+1 queries) late in the development cycle during manual peer code reviews. Existing automated tools are either expensive SaaS products or require massive local compute resources to run open-source models locally.
* **The Solution:** CodeLens runs as a lightning-fast local CLI tool that parses git diffs, ships them to a dedicated local backend, orchestrates parallel multi-agent prompts using zero-cost cloud API tiers, and reports structured, actionable markdown inline feedback back to the terminal.

---

## 3. Product Features & Scope

### 3.1. Local CLI Component (`cli/`)

* **Command Execution:** Provides a globally accessible command `codelens review`.
* **Git Diff Ingestion:** Automatically spawns a child process executing `git diff HEAD -U3` to capture untracked and unstaged changes along with three lines of surrounding context code.
* **Line-Number Prefixing:** Pre-indexes every incoming code block chunk with explicit absolute line numbers before shipping the payload to prevent model hallucinations during line-matching.

### 3.2. Multi-Agent AI Engine (Backend `backend/`)

The system divides code analysis into distinct specialized tasks to avoid context dilution and ensure strict validation against structured output targets.

| Evaluation Module | Focus Area | Severity Categorization |
| --- | --- | --- |
| **Syntax & Bug Detection** | Logical flaws, edge cases, type mismatches, and potential runtime crashes. | HIGH / MEDIUM / LOW |
| **Security Scanning** | Hardcoded secrets, OWASP Top 10 vulnerabilities, injection risks, and weak crypto. | HIGH / MEDIUM |
| **Performance Optimization** | Unoptimized loops, database query patterns, memory leaks, and algorithmic bottlenecks. | HIGH / MEDIUM / LOW |
| **Style & Readability** | Structural inconsistencies, confusing naming, missing documentation, or anti-patterns. | LOW |

### 3.3. Analytics Web Dashboard (Frontend `frontend/`)

* **Technical Debt Tracking:** Computes an aggregate "Technical Debt Score" (scaled from 0 to 100) for every review pass based on deductions mapped to detected severity metrics.
* **Trend Analysis:** Displays interactive charts tracking repository code health over days, weeks, and months.
* **Historical Audits:** Maintains an indexed history of past terminal review outputs, allowing teams to review historical code fixes.

---

## 4. Technical Architecture Specifications

### 4.1. Core Tech Stack

* **CLI:** Node.js, `commander.js` for command parsing, `execa` or native `child_process` for Git interaction.
* **Backend:** FastAPI (Python 3.11+), Pydantic v2 for structured validation, `asyncio` for non-blocking concurrent LLM streaming.
* **Database:** Supabase (PostgreSQL) for persistent telemetry logging.
* **Frontend:** Next.js 15 (App Router), Tailwind CSS, TypeScript.

### 4.2. Concrete Data Flow Diagram

```
[Developer Terminal] ──(git diff HEAD)──► [Local CLI Wrapper]
                                                  │
                                          (JSON Post Payload)
                                                  │
                                                  ▼
                                         [FastAPI Endpoint]
                                                  │
                ┌─────────────────────────────────┼────────────────────────────────┐
                ▼ (Async Task 1)                  ▼ (Async Task 2)                 ▼ (Async Task 3)
      [Security AI Agent]               [Performance AI Agent]           [Style/Bug AI Agent]
     (DeepSeek V4 Flash)               (DeepSeek V4 Flash)              (DeepSeek V4 Flash)
                │                                 │                                │
                └─────────────────────────────────┼────────────────────────────────┘
                                                  │ (Aggregated JSON Responses)
                                                  ▼
                                        [Supabase Telemetry]
                                                  │
                                                  ▼
                                      [Terminal Output Render]

```

---

## 5. Non-Functional & Operational Requirements

### 5.1. Performance & Latency

* **Parallel Evaluation:** The backend must execute all agent prompts concurrently using `asyncio.gather()`. Total analysis execution latency for code changes under 500 lines must remain below 4 seconds.
* **CLI Responsiveness:** The CLI must display an active loading state or progress step tracker during backend execution to maintain optimal user feedback loops.

### 5.2. Data Privacy & Token Limits

* **Data Ephemerality:** Code fragments must only be kept in backend memory long enough to fulfill the prompt generation and save metrics tracking logs. Code snippets should never be persistently stored inside the database unless explicitly requested.
* **Token Management:** The system will leverage models offering high token-context thresholds (minimum 256k tokens) to safely accommodate broad repository file mapping parameters.

### 5.3. Cost & Extensibility

* **Zero Infrastructure Overhead:** The system must run entirely on free provider tiers out of the box.
* **Provider Agnosticism:** The backend configuration layer must rely on uniform OpenAI-compatible environment variables, ensuring developers can switch from cloud free tiers to local infrastructure backends seamlessly.
**