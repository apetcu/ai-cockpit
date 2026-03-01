import { Database } from "bun:sqlite";
import { join } from "path";
import { mkdirSync } from "fs";

const DATA_DIR = join(import.meta.dir, "..", "data");
mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = join(DATA_DIR, "cockpit.db");
const db = new Database(DB_PATH, { create: true });

// Enable WAL mode for better concurrent read performance
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    session_id TEXT NOT NULL,
    project TEXT,
    tool_name TEXT,
    tool_input TEXT,
    timestamp TEXT NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);
// Migrate: add project column if missing
try {
  db.exec("ALTER TABLE events ADD COLUMN project TEXT");
} catch {
  // Column already exists
}

db.exec("CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id)");
db.exec("CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type)");
db.exec("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)");

export default db;

export const insertEvent = db.prepare(`
  INSERT INTO events (event_type, session_id, project, tool_name, tool_input, timestamp, input_tokens, output_tokens)
  VALUES ($event_type, $session_id, $project, $tool_name, $tool_input, $timestamp, $input_tokens, $output_tokens)
`);

export const getEvents = (filters: {
  session_id?: string;
  event_type?: string;
  limit?: number;
}) => {
  const conditions: string[] = [];
  const params: Record<string, string | number> = {};

  if (filters.session_id) {
    conditions.push("session_id = $session_id");
    params.$session_id = filters.session_id;
  }
  if (filters.event_type) {
    conditions.push("event_type = $event_type");
    params.$event_type = filters.event_type;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = filters.limit || 500;
  params.$limit = limit;

  return db
    .prepare(`SELECT * FROM events ${where} ORDER BY timestamp DESC LIMIT $limit`)
    .all(params);
};

export const getSessions = () => {
  return db
    .prepare(`
      SELECT
        session_id,
        MAX(project) as project,
        MIN(timestamp) as first_event_at,
        MAX(timestamp) as last_event_at,
        COUNT(*) as event_count,
        COUNT(CASE WHEN event_type = 'post_tool_use' THEN 1 END) as tool_calls_count
      FROM events
      GROUP BY session_id
      ORDER BY MAX(timestamp) DESC
    `)
    .all();
};

export const getSessionEvents = (sessionId: string) => {
  return db
    .prepare(`SELECT * FROM events WHERE session_id = $session_id ORDER BY timestamp ASC`)
    .all({ $session_id: sessionId });
};

export const getStats = () => {
  return db
    .prepare(`
      SELECT
        COUNT(DISTINCT CASE
          WHEN timestamp >= datetime('now', '-5 minutes') THEN session_id
        END) as active_sessions,
        COUNT(*) as total_events,
        COUNT(CASE WHEN event_type = 'post_tool_use' THEN 1 END) as tool_calls,
        COUNT(DISTINCT CASE WHEN tool_name IS NOT NULL AND tool_name != '' THEN tool_name END) as unique_tools
      FROM events
    `)
    .get();
};

export const getToolBreakdown = () => {
  return db
    .prepare(`
      SELECT tool_name, COUNT(*) as count
      FROM events
      WHERE tool_name IS NOT NULL AND tool_name != ''
      GROUP BY tool_name
      ORDER BY count DESC
    `)
    .all();
};
