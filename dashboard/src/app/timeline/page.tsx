"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/glass-card";
import { subscribe } from "@/components/dashboard-shell";
import { getEvents, getSessions } from "@/lib/api";
import {
  formatTimestamp,
  truncateSessionId,
  sessionColor,
  TOOL_COLORS,
  cn,
} from "@/lib/utils";
import type { TelemetryEvent, Session } from "@/lib/types";

const LANE_HEIGHT = 48;
const MIN_BLOCK_WIDTH = 6;
const PIXELS_PER_SECOND = 3;

interface TooltipData {
  event: TelemetryEvent;
  x: number;
  y: number;
}

export default function TimelinePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    Promise.all([getSessions(), getEvents({ limit: 500 })]).then(
      ([s, e]) => {
        setSessions(s);
        setEvents(e.reverse());
      }
    );
  }, []);

  useEffect(() => {
    return subscribe((event) => {
      setEvents((prev) => [...prev, event]);
    });
  }, []);

  // Calculate time range
  const { timeMin, timeMax, totalWidth } = useMemo(() => {
    if (events.length === 0) {
      return { timeMin: Date.now(), timeMax: Date.now() + 60000, totalWidth: 800 };
    }
    const timestamps = events.map((e) => new Date(e.timestamp).getTime());
    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps);
    const rangeSeconds = (max - min) / 1000;
    const width = Math.max(800, rangeSeconds * PIXELS_PER_SECOND + 100);
    return { timeMin: min, timeMax: max, totalWidth: width };
  }, [events]);

  // Group events by session
  const sessionEvents = useMemo(() => {
    const map = new Map<string, TelemetryEvent[]>();
    for (const event of events) {
      if (!map.has(event.session_id)) map.set(event.session_id, []);
      map.get(event.session_id)!.push(event);
    }
    return map;
  }, [events]);

  const sessionIds = useMemo(
    () => [...sessionEvents.keys()],
    [sessionEvents]
  );

  // Auto-scroll to right edge
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [events, totalWidth, autoScroll]);

  const timeToX = useCallback(
    (ts: string) => {
      const t = new Date(ts).getTime();
      const range = timeMax - timeMin || 1;
      return ((t - timeMin) / range) * (totalWidth - 100) + 50;
    },
    [timeMin, timeMax, totalWidth]
  );

  // Generate time axis ticks
  const ticks = useMemo(() => {
    const result: { x: number; label: string }[] = [];
    const range = timeMax - timeMin;
    const tickCount = Math.max(2, Math.min(20, Math.floor(totalWidth / 120)));
    for (let i = 0; i <= tickCount; i++) {
      const t = timeMin + (range * i) / tickCount;
      result.push({
        x: ((t - timeMin) / (range || 1)) * (totalWidth - 100) + 50,
        label: formatTimestamp(new Date(t).toISOString()),
      });
    }
    return result;
  }, [timeMin, timeMax, totalWidth]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold tracking-tight">Timeline</h1>
          <p className="text-sm text-foreground-muted mt-0.5">
            Swim-lane view of session activity
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-foreground-subtle">
          {Object.entries(TOOL_COLORS).map(([tool, color]) => (
            <div key={tool} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{
                  backgroundColor: color,
                  border: tool === "Agent" ? "1px solid rgba(255,255,255,0.3)" : "none",
                }}
              />
              {tool}
            </div>
          ))}
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-auto max-h-[600px]"
          onScroll={() => {
            if (!scrollRef.current) return;
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setAutoScroll(scrollWidth - scrollLeft - clientWidth < 80);
          }}
        >
          <div
            style={{ width: totalWidth, minHeight: sessionIds.length * LANE_HEIGHT + 60 }}
            className="relative"
          >
            {/* Time axis */}
            <div className="sticky top-0 z-20 h-8 bg-[#0A0A0A]/90 backdrop-blur border-b border-white/[0.06]">
              {ticks.map((tick, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full flex items-center"
                  style={{ left: tick.x }}
                >
                  <span className="text-[10px] font-mono text-foreground-subtle -translate-x-1/2">
                    {tick.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid lines */}
            {ticks.map((tick, i) => (
              <div
                key={i}
                className="absolute top-8 bottom-0 w-px bg-white/[0.03]"
                style={{ left: tick.x }}
              />
            ))}

            {/* Session lanes */}
            {sessionIds.map((sessionId, laneIndex) => {
              const laneEvents = sessionEvents.get(sessionId) || [];
              const toolEvents = laneEvents.filter(
                (e) =>
                  (e.event_type === "post_tool_use" || e.event_type === "pre_tool_use") &&
                  e.tool_name
              );

              return (
                <div
                  key={sessionId}
                  className="relative border-b border-white/[0.03]"
                  style={{
                    top: 32,
                    height: LANE_HEIGHT,
                  }}
                >
                  {/* Session label */}
                  <div className="sticky left-0 z-10 inline-flex items-center h-full px-2">
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 backdrop-blur"
                      style={{ color: sessionColor(sessionId) }}
                    >
                      {truncateSessionId(sessionId)}
                    </span>
                  </div>

                  {/* Tool call blocks */}
                  {toolEvents.map((event, eventIdx) => {
                    const x = timeToX(event.timestamp);
                    const color = TOOL_COLORS[event.tool_name!] || "#555";
                    const isAgent = event.tool_name === "Agent";

                    return (
                      <motion.div
                        key={eventIdx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute cursor-pointer"
                        style={{
                          left: x,
                          top: LANE_HEIGHT / 2 - 8,
                          width: MIN_BLOCK_WIDTH,
                          height: 16,
                          borderRadius: 3,
                          backgroundColor: isAgent ? "transparent" : color,
                          border: isAgent
                            ? `1px solid ${color}`
                            : `1px solid ${color}`,
                          boxShadow: `0 0 8px ${color}40`,
                        }}
                        onMouseEnter={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTooltip({
                            event,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="bg-[#1a1a1a] border border-white/[0.12] rounded-lg px-3 py-2 shadow-xl text-xs">
              <div className="font-mono text-foreground-muted mb-1">
                {formatTimestamp(tooltip.event.timestamp)}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {tooltip.event.tool_name}
                </span>
                <span className="text-foreground-subtle">
                  {tooltip.event.event_type}
                </span>
              </div>
              {tooltip.event.tool_input && (
                <div className="mt-1 text-[10px] text-foreground-subtle max-w-xs truncate">
                  {(() => {
                    try {
                      const parsed = JSON.parse(tooltip.event.tool_input!);
                      return parsed.command || parsed.file_path || parsed.pattern || JSON.stringify(parsed).slice(0, 80);
                    } catch {
                      return tooltip.event.tool_input!.slice(0, 80);
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <div className="py-16 text-center text-foreground-subtle text-sm">
            No session data to display
          </div>
        )}
      </GlassCard>
    </div>
  );
}
