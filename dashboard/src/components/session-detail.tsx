import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./glass-card";
import { getSessionEvents } from "@/lib/api";
import {
  formatTimestamp,
  truncateSessionId,
  sessionColor,
  TOOL_COLORS_CLASS,
  EVENT_TYPE_STYLES,
  cn,
} from "@/lib/utils";
import type { TelemetryEvent } from "@/lib/types";

interface SessionDetailProps {
  sessionId: string;
  onBack: () => void;
}

export function SessionDetail({ sessionId, onBack }: SessionDetailProps) {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    getSessionEvents(sessionId).then(setEvents);
  }, [sessionId]);

  const toggleExpand = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-sm text-foreground-muted hover:text-foreground transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Sessions
        </button>
        <div>
          <h1 className="text-lg font-display font-semibold tracking-tight flex items-center gap-2">
            <span style={{ color: sessionColor(sessionId) }}>
              {truncateSessionId(sessionId)}
            </span>
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            {events.length} events
          </p>
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="relative ml-4">
        {/* Timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-white/[0.08]" />

        <div className="space-y-2">
          {events.map((event, i) => {
            const hasInput = event.tool_input && event.tool_input !== "null";
            const isExpanded = expanded.has(i);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
                className="relative pl-10"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-1.5 top-3 w-3 h-3 rounded-full border-2 border-background"
                  style={{
                    backgroundColor:
                      event.event_type === "session_start"
                        ? "#10b981"
                        : event.event_type === "session_end"
                        ? "#ef4444"
                        : "#008B8B",
                  }}
                />

                <GlassCard
                  className={cn(
                    "p-3",
                    hasInput && "cursor-pointer"
                  )}
                  onClick={() => hasInput && toggleExpand(i)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-foreground-subtle">
                      {formatTimestamp(event.timestamp)}
                    </span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded border text-[10px]",
                        EVENT_TYPE_STYLES[event.event_type] || "bg-white/10 text-white/60 border-white/10"
                      )}
                    >
                      {event.event_type}
                    </span>
                    {event.tool_name && (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded border text-[10px] font-medium",
                          TOOL_COLORS_CLASS[event.tool_name] || "bg-white/10 text-white/60 border-white/10"
                        )}
                      >
                        {event.tool_name}
                      </span>
                    )}
                    {hasInput && (
                      <svg
                        className={cn(
                          "w-3 h-3 text-foreground-subtle transition-transform ml-auto",
                          isExpanded && "rotate-180"
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    )}
                  </div>
                  {isExpanded && hasInput && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 overflow-hidden"
                    >
                      <pre className="text-[11px] font-mono text-foreground-muted bg-black/30 rounded-md p-3 overflow-x-auto">
                        {(() => {
                          try {
                            return JSON.stringify(JSON.parse(event.tool_input!), null, 2);
                          } catch {
                            return event.tool_input;
                          }
                        })()}
                      </pre>
                    </motion.div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
