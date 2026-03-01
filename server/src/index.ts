import {
  insertEvent,
  getEvents,
  getSessions,
  getSessionEvents,
  getStats,
  getToolBreakdown,
} from "./db";

const PORT = 7777;
const wsClients = new Set<any>();

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

const server = Bun.serve({
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req);
      if (!upgraded) {
        return new Response("WebSocket upgrade failed", { status: 400 });
      }
      return undefined;
    }

    // POST /events — receive telemetry
    if (url.pathname === "/events" && req.method === "POST") {
      return req.json().then((body: any) => {
        const event = {
          $event_type: body.event_type || "unknown",
          $session_id: body.session_id || "unknown",
          $project: body.project || null,
          $tool_name: body.tool_name || null,
          $tool_input: body.tool_input ? JSON.stringify(body.tool_input) : null,
          $timestamp: body.timestamp || new Date().toISOString(),
          $input_tokens: body.input_tokens ?? null,
          $output_tokens: body.output_tokens ?? null,
        };

        insertEvent.run(event);

        const stored = {
          event_type: event.$event_type,
          session_id: event.$session_id,
          project: event.$project,
          tool_name: event.$tool_name,
          tool_input: event.$tool_input,
          timestamp: event.$timestamp,
          input_tokens: event.$input_tokens,
          output_tokens: event.$output_tokens,
        };

        // Broadcast to all WebSocket clients
        const message = JSON.stringify({ type: "new_event", data: stored });
        for (const ws of wsClients) {
          try {
            ws.send(message);
          } catch {
            wsClients.delete(ws);
          }
        }

        return json({ ok: true, event: stored }, 201);
      });
    }

    // GET /events — query events
    if (url.pathname === "/events" && req.method === "GET") {
      const session_id = url.searchParams.get("session_id") || undefined;
      const event_type = url.searchParams.get("event_type") || undefined;
      const limit = url.searchParams.get("limit")
        ? parseInt(url.searchParams.get("limit")!)
        : undefined;
      return json(getEvents({ session_id, event_type, limit }));
    }

    // GET /sessions — list sessions
    if (url.pathname === "/sessions" && req.method === "GET") {
      return json(getSessions());
    }

    // GET /sessions/:id — get session events
    if (url.pathname.startsWith("/sessions/") && req.method === "GET") {
      const sessionId = url.pathname.split("/sessions/")[1];
      if (sessionId) {
        return json(getSessionEvents(sessionId));
      }
    }

    // GET /stats — dashboard stats
    if (url.pathname === "/stats" && req.method === "GET") {
      return json(getStats());
    }

    // GET /tools — tool breakdown
    if (url.pathname === "/tools" && req.method === "GET") {
      return json(getToolBreakdown());
    }

    // Health check
    if (url.pathname === "/health") {
      return json({ status: "ok", uptime: process.uptime() });
    }

    return json({ error: "Not found" }, 404);
  },

  websocket: {
    open(ws) {
      wsClients.add(ws);
      console.log(`WebSocket client connected (${wsClients.size} total)`);
    },
    message() {},
    close(ws) {
      wsClients.delete(ws);
      console.log(`WebSocket client disconnected (${wsClients.size} total)`);
    },
  },
});

console.log(`
  ╔══════════════════════════════════════════╗
  ║         AI Cockpit API Server            ║
  ║──────────────────────────────────────────║
  ║  HTTP:  http://localhost:${PORT}            ║
  ║  WS:    ws://localhost:${PORT}/ws           ║
  ╚══════════════════════════════════════════╝
`);
