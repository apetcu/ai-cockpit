import { API_BASE } from "./utils";
import type { TelemetryEvent, Session, Stats, ToolBreakdown } from "./types";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function getStats(): Promise<Stats> {
  return fetchJSON("/stats");
}

export function getEvents(params?: {
  session_id?: string;
  event_type?: string;
  limit?: number;
}): Promise<TelemetryEvent[]> {
  const searchParams = new URLSearchParams();
  if (params?.session_id) searchParams.set("session_id", params.session_id);
  if (params?.event_type) searchParams.set("event_type", params.event_type);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return fetchJSON(`/events${qs ? `?${qs}` : ""}`);
}

export function getSessions(): Promise<Session[]> {
  return fetchJSON("/sessions");
}

export function getSessionEvents(sessionId: string): Promise<TelemetryEvent[]> {
  return fetchJSON(`/sessions/${sessionId}`);
}

export function getToolBreakdown(): Promise<ToolBreakdown[]> {
  return fetchJSON("/tools");
}
