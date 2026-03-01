import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/glass-card";
import { SessionDetail } from "@/components/session-detail";
import { getSessions } from "@/lib/api";
import {
  formatTimestamp,
  formatDuration,
  timeAgo,
  truncateSessionId,
  sessionColor,
} from "@/lib/utils";
import type { Session } from "@/lib/types";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    getSessions().then(setSessions);
  }, []);

  if (selected) {
    return (
      <SessionDetail
        sessionId={selected}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-display font-semibold tracking-tight">Sessions</h1>
        <p className="text-sm text-foreground-muted mt-0.5">
          All Claude Code agent sessions
        </p>
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Session</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Started</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Last Activity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Duration</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Events</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Tool Calls</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, i) => {
                const isRecent =
                  Date.now() - new Date(session.last_event_at).getTime() < 5 * 60 * 1000;

                return (
                  <motion.tr
                    key={session.session_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(session.session_id)}
                    className="border-b border-white/[0.03] cursor-pointer hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isRecent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
                        )}
                        <span
                          className="font-mono text-xs"
                          style={{ color: sessionColor(session.session_id) }}
                        >
                          {truncateSessionId(session.session_id)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted font-mono text-xs">
                      {formatTimestamp(session.first_event_at)}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted text-xs">
                      {timeAgo(session.last_event_at)}
                    </td>
                    <td className="px-4 py-3 text-foreground-subtle text-xs">
                      {formatDuration(session.first_event_at, session.last_event_at)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-foreground-muted">
                      {session.event_count}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-accent">
                      {session.tool_calls_count}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sessions.length === 0 && (
          <div className="py-12 text-center text-foreground-subtle text-sm">
            No sessions recorded yet
          </div>
        )}
      </GlassCard>
    </div>
  );
}
