"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./glass-card";
import { subscribe } from "./dashboard-shell";
import { getEvents } from "@/lib/api";
import {
  formatTimestamp,
  truncateSessionId,
  sessionColor,
  TOOL_COLORS_CLASS,
  EVENT_TYPE_STYLES,
  cn,
} from "@/lib/utils";
import type { TelemetryEvent } from "@/lib/types";

export function EventFeed() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [filterSession, setFilterSession] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load initial events (already descending from API)
  useEffect(() => {
    getEvents({ limit: 100 }).then((data) => {
      setEvents(data);
    });
  }, []);

  // Subscribe to real-time events — prepend newest to top
  useEffect(() => {
    return subscribe((event) => {
      setEvents((prev) => [event, ...prev].slice(0, 200));
    });
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filterSession && e.session_id !== filterSession) return false;
    if (filterType && e.event_type !== filterType) return false;
    return true;
  });

  const sessions = [...new Set(events.map((e) => e.session_id))];
  const eventTypes = [...new Set(events.map((e) => e.event_type))];

  return (
    <GlassCard className="flex flex-col h-[540px]">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Live Event Feed</h3>
        <div className="flex gap-2">
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="text-xs bg-white/[0.06] border border-white/[0.1] rounded-md px-2 py-1 text-foreground-muted outline-none"
          >
            <option value="">All sessions</option>
            {sessions.map((s) => (
              <option key={s} value={s}>{truncateSessionId(s)}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-white/[0.06] border border-white/[0.1] rounded-md px-2 py-1 text-foreground-muted outline-none"
          >
            <option value="">All types</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[80px_120px_120px_1fr] gap-2 px-4 py-2 border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-foreground-subtle font-medium">
        <span>Time</span>
        <span>Session</span>
        <span>Event</span>
        <span>Tool</span>
      </div>

      {/* Scrollable table body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        <AnimatePresence initial={false}>
          {filteredEvents.map((event, i) => (
            <motion.div
              key={`${event.id ?? ''}-${event.timestamp}-${i}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-[80px_120px_120px_1fr] gap-2 px-4 py-1.5 border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors text-xs items-center"
            >
              <span className="text-foreground-subtle font-mono">
                {formatTimestamp(event.timestamp)}
              </span>
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded w-fit"
                style={{
                  color: sessionColor(event.session_id),
                  backgroundColor: sessionColor(event.session_id) + "15",
                }}
              >
                {truncateSessionId(event.session_id)}
              </span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded border text-[10px] w-fit",
                  EVENT_TYPE_STYLES[event.event_type] || "bg-white/10 text-white/60 border-white/10"
                )}
              >
                {event.event_type}
              </span>
              <span>
                {event.tool_name ? (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded border text-[10px] font-medium",
                      TOOL_COLORS_CLASS[event.tool_name] || "bg-white/10 text-white/60 border-white/10"
                    )}
                  >
                    {event.tool_name}
                  </span>
                ) : (
                  <span className="text-foreground-subtle text-[10px]">—</span>
                )}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredEvents.length === 0 && (
          <div className="flex items-center justify-center h-full text-foreground-subtle text-sm">
            No events
          </div>
        )}
      </div>
    </GlassCard>
  );
}
