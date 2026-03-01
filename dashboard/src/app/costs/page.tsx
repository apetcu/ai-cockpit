"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/glass-card";

const MOCK_SESSIONS = [
  { id: "sess_a1b2", model: "Opus", cost: "$2.34", tokens: "12,450" },
  { id: "sess_e5f6", model: "Sonnet", cost: "$0.87", tokens: "28,300" },
  { id: "sess_i9j0", model: "Sonnet", cost: "$0.42", tokens: "14,100" },
  { id: "sess_m3n4", model: "Haiku", cost: "$0.08", tokens: "9,200" },
];

const MOCK_MODELS = [
  { name: "Opus", pct: 63, cost: "$2.34" },
  { name: "Sonnet", pct: 28, cost: "$1.29" },
  { name: "Haiku", pct: 9, cost: "$0.08" },
];

export default function CostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-display font-semibold tracking-tight">Cost Tracker</h1>
        <p className="text-sm text-foreground-muted mt-0.5">
          Monitor token usage and API costs
        </p>
      </div>

      {/* Info banner */}
      <GlassCard className="p-4 border-accent/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-foreground">
              Cost tracking requires token usage data in events.
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              Add <code className="px-1 py-0.5 rounded bg-white/[0.06] text-accent font-mono text-[11px]">input_tokens</code> and{" "}
              <code className="px-1 py-0.5 rounded bg-white/[0.06] text-accent font-mono text-[11px]">output_tokens</code> fields
              to your hook payload to enable this view. The mock data below shows what it would look like.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Mock overview stats */}
      <div className="grid grid-cols-3 gap-4 opacity-50">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <GlassCard className="p-4">
            <div className="text-xs text-foreground-muted uppercase tracking-wider mb-2">Total Cost</div>
            <div className="text-2xl font-display font-semibold text-foreground">$3.71</div>
            <div className="text-xs text-foreground-subtle mt-1">This session</div>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <GlassCard className="p-4">
            <div className="text-xs text-foreground-muted uppercase tracking-wider mb-2">Total Tokens</div>
            <div className="text-2xl font-display font-semibold text-foreground">64,050</div>
            <div className="text-xs text-foreground-subtle mt-1">Input + Output</div>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <GlassCard className="p-4">
            <div className="text-xs text-foreground-muted uppercase tracking-wider mb-2">Avg Cost / Session</div>
            <div className="text-2xl font-display font-semibold text-foreground">$0.93</div>
            <div className="text-xs text-foreground-subtle mt-1">Across 4 sessions</div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-4 opacity-50">
        {/* Mock cumulative cost chart */}
        <GlassCard className="p-4 h-[320px]">
          <h3 className="text-sm font-medium text-foreground mb-4">Cumulative Cost Over Time</h3>
          <div className="relative h-[240px] flex items-end gap-1.5 px-2">
            {Array.from({ length: 20 }, (_, i) => {
              const height = Math.min(100, 10 + i * 4 + Math.random() * 15);
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.03, duration: 0.5 }}
                  className="flex-1 rounded-t bg-accent/30 border border-accent/20"
                />
              );
            })}
          </div>
        </GlassCard>

        {/* Mock model breakdown */}
        <GlassCard className="p-4 h-[320px]">
          <h3 className="text-sm font-medium text-foreground mb-4">Model Breakdown</h3>
          <div className="space-y-4">
            {MOCK_MODELS.map((model, i) => (
              <div key={model.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground-muted">{model.name}</span>
                  <span className="font-mono text-foreground-subtle">{model.cost}</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    style={{ opacity: 1 - i * 0.25 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${model.pct}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="text-xs text-foreground-muted mb-3">Per Session</h4>
            <div className="space-y-2">
              {MOCK_SESSIONS.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-foreground-subtle">{s.id}</span>
                  <span className="text-foreground-subtle">{s.model}</span>
                  <span className="font-mono text-foreground-muted">{s.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
