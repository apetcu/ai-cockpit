import { useCallback, useState } from "react";
import { Sidebar } from "./sidebar";
import { useWebSocket } from "@/lib/useWebSocket";
import type { TelemetryEvent } from "@/lib/types";

type EventListener = (event: TelemetryEvent) => void;

const listeners = new Set<EventListener>();

export function subscribe(fn: EventListener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const handleEvent = useCallback((event: TelemetryEvent) => {
    for (const fn of listeners) {
      fn(event);
    }
  }, []);

  const { connected } = useWebSocket(handleEvent);

  return (
    <div className="min-h-screen">
      <Sidebar wsConnected={connected} />
      <main className="pl-56">
        <div className="p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
