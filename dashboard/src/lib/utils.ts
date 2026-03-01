import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE = "http://localhost:7777";
export const WS_URL = "ws://localhost:7777/ws";

export function truncateSessionId(id: string): string {
  if (id.length <= 12) return id;
  return id.slice(0, 12) + "...";
}

export function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatDuration(startTs: string, endTs: string): string {
  const ms = new Date(endTs).getTime() - new Date(startTs).getTime();
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function timeAgo(ts: string): string {
  const ms = Date.now() - new Date(ts).getTime();
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

const SESSION_COLORS = [
  "#008B8B",
  "#6366f1",
  "#f59e0b",
  "#ec4899",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

export function sessionColor(sessionId: string): string {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = sessionId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SESSION_COLORS[Math.abs(hash) % SESSION_COLORS.length];
}

export const TOOL_COLORS: Record<string, string> = {
  Bash: "#008B8B",
  Read: "#64748b",
  Write: "#b8860b",
  Edit: "#7c3aed",
  Grep: "#475569",
  Glob: "#475569",
  Agent: "rgba(255, 255, 255, 0.7)",
};

export const TOOL_COLORS_CLASS: Record<string, string> = {
  Bash: "bg-[#008B8B]/20 text-[#00b3b3] border-[#008B8B]/30",
  Read: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  Write: "bg-amber-700/20 text-amber-400 border-amber-700/30",
  Edit: "bg-violet-600/20 text-violet-300 border-violet-600/30",
  Grep: "bg-slate-600/20 text-slate-400 border-slate-600/30",
  Glob: "bg-slate-600/20 text-slate-400 border-slate-600/30",
  Agent: "bg-white/10 text-white/80 border-white/20",
};

export const EVENT_TYPE_STYLES: Record<string, string> = {
  session_start: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  session_end: "bg-red-500/15 text-red-400 border-red-500/25",
  pre_tool_use: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  post_tool_use: "bg-[#008B8B]/15 text-[#00b3b3] border-[#008B8B]/25",
  stop: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  subagent_start: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  subagent_stop: "bg-purple-500/10 text-purple-300 border-purple-500/20",
};
