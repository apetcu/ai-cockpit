# AI Cockpit

<img src="!/ai_cockpit.gif" alt="AI Cockpit" width="100%">

Real-time observability dashboard for Claude Code agent sessions.

```
Claude Code hooks → Python script → API (SQLite + WebSocket) → Dashboard
```

## Quick Start

### 1. Start the API server

```bash
cd server
bun install
bun run seed    # populate with sample data (optional)
bun run dev     # starts on http://localhost:7777
```

### 2. Start the dashboard

```bash
cd dashboard
bun install
bun run dev     # starts on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### 3. Configure Claude Code hooks (optional)

Copy the hook script to a convenient location:

```bash
cp hooks/telemetry.py ~/.claude/hooks/telemetry.py
```

Then add the hooks to your `~/.claude/settings.json`. See `claude-hooks-config.json` for the full configuration — update the path to point to where you copied `telemetry.py`.

## Architecture

| Component | Port | Description |
|-----------|------|-------------|
| API Server | 7777 | Bun server with SQLite storage + WebSocket |
| Dashboard | 3000 | Next.js + Tailwind CSS glassmorphism UI |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/events` | Receive telemetry events |
| `GET` | `/events` | Query events (`?session_id=X&event_type=Y&limit=100`) |
| `GET` | `/sessions` | List all sessions with stats |
| `GET` | `/sessions/:id` | Get all events for a session |
| `GET` | `/stats` | Dashboard summary stats |
| `GET` | `/tools` | Tool usage breakdown |
| `GET` | `/health` | Health check |
| `WS` | `/ws` | Real-time event stream |

### Dashboard Pages

- **Overview** — Live stats, event feed, and tool usage chart
- **Sessions** — Session table with drill-down timeline view
- **Timeline** — Swim-lane visualization of all sessions
- **Costs** — Placeholder for token/cost tracking (requires `input_tokens`/`output_tokens` in events)

## Tech Stack

- **Backend**: Bun + `bun:sqlite` + Bun WebSocket
- **Frontend**: Next.js 16 + Tailwind CSS v4 + Framer Motion
- **Hook**: Python 3 (stdlib only, no dependencies)

## Development

The API server auto-reloads on file changes with `bun run --watch`.

To re-seed the database with fresh mock data:

```bash
cd server && bun run seed
```

The SQLite database is stored at `server/data/cockpit.db`.
