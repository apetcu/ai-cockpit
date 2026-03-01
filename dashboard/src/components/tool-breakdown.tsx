import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./glass-card";
import { subscribe } from "./dashboard-shell";
import { getToolBreakdown } from "@/lib/api";
import { TOOL_COLORS, cn } from "@/lib/utils";
import type { ToolBreakdown } from "@/lib/types";

export function ToolBreakdownChart() {
  const [tools, setTools] = useState<ToolBreakdown[]>([]);

  useEffect(() => {
    getToolBreakdown().then(setTools);
  }, []);

  // Refresh on new events
  useEffect(() => {
    return subscribe(() => {
      getToolBreakdown().then(setTools);
    });
  }, []);

  const maxCount = Math.max(...tools.map((t) => t.count), 1);

  return (
    <GlassCard className="h-[540px] flex flex-col">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h3 className="text-sm font-medium text-foreground">Tool Usage</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.tool_name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground-muted">
                {tool.tool_name}
              </span>
              <span className="text-xs font-mono text-foreground-subtle">
                {tool.count}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: TOOL_COLORS[tool.tool_name] || "#555",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(tool.count / maxCount) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.div>
        ))}
        {tools.length === 0 && (
          <div className="flex items-center justify-center h-full text-foreground-subtle text-sm">
            No tool data
          </div>
        )}
      </div>
    </GlassCard>
  );
}
