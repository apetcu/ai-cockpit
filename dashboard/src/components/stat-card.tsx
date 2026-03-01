"use client";

import { motion } from "framer-motion";
import { GlassCard } from "./glass-card";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  pulse?: boolean;
  index?: number;
}

export function StatCard({ label, value, subtitle, pulse, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="p-4">
        <div className="text-xs text-foreground-muted uppercase tracking-wider mb-2">
          {label}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-display font-semibold tracking-tight text-foreground">
            {value}
          </span>
          {pulse && (
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
          )}
        </div>
        {subtitle && (
          <div className="text-xs text-foreground-subtle mt-1">{subtitle}</div>
        )}
      </GlassCard>
    </motion.div>
  );
}
