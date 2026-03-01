export interface TelemetryEvent {
  id: number;
  event_type: string;
  session_id: string;
  project: string | null;
  tool_name: string | null;
  tool_input: string | null;
  model: string | null;
  agent_type: string | null;
  agent_id: string | null;
  timestamp: string;
  created_at: string;
}

export interface Session {
  session_id: string;
  project: string | null;
  model: string | null;
  first_event_at: string;
  last_event_at: string;
  event_count: number;
  tool_calls_count: number;
  subagent_count: number;
}

export interface Stats {
  active_sessions: number;
  total_events: number;
  tool_calls: number;
  unique_tools: number;
  unique_projects: number;
}

export interface ToolBreakdown {
  tool_name: string;
  count: number;
}
