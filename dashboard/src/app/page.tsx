"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { EventFeed } from "@/components/event-feed";
import { ToolBreakdownChart } from "@/components/tool-breakdown";
import { subscribe } from "@/components/dashboard-shell";
import { getStats } from "@/lib/api";
import type { Stats } from "@/lib/types";

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  // Refresh stats on new events
  useEffect(() => {
    return subscribe(() => {
      getStats().then(setStats);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-display font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-foreground-muted mt-0.5">
          Real-time telemetry from Claude Code sessions
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Active Sessions"
          value={stats?.active_sessions ?? "—"}
          subtitle="Last 5 min"
          pulse={!!stats?.active_sessions}
          index={0}
        />
        <StatCard
          label="Total Events"
          value={stats?.total_events ?? "—"}
          index={1}
        />
        <StatCard
          label="Tool Calls"
          value={stats?.tool_calls ?? "—"}
          subtitle="post_tool_use"
          index={2}
        />
        <StatCard
          label="Unique Tools"
          value={stats?.unique_tools ?? "—"}
          index={3}
        />
      </div>

      <div className="grid grid-cols-[1fr_400px] gap-4">
        <EventFeed />
        <ToolBreakdownChart />
      </div>
    </div>
  );
}
