import db, { insertEvent } from "./db";

// Clear existing data
db.exec("DELETE FROM events");

const SESSIONS = [
  { id: "sess_a1b2c3d4", label: "refactor-auth" },
  { id: "sess_e5f6g7h8", label: "fix-api-bug" },
  { id: "sess_i9j0k1l2", label: "add-dashboard" },
  { id: "sess_m3n4o5p6", label: "write-tests" },
];

const TOOLS = ["Bash", "Read", "Write", "Edit", "Grep", "Glob", "Agent"];

const SAMPLE_INPUTS: Record<string, object[]> = {
  Bash: [
    { command: "npm test", description: "Run test suite" },
    { command: "git status", description: "Check git status" },
    { command: "ls -la src/", description: "List source files" },
    { command: "bun run build", description: "Build project" },
  ],
  Read: [
    { file_path: "src/index.ts" },
    { file_path: "src/components/Button.tsx" },
    { file_path: "package.json" },
    { file_path: "tsconfig.json" },
  ],
  Write: [
    { file_path: "src/utils/helpers.ts", content: "export function formatDate..." },
    { file_path: "src/components/Modal.tsx", content: "export function Modal..." },
  ],
  Edit: [
    { file_path: "src/index.ts", old_string: "const port = 3000", new_string: "const port = 8080" },
    { file_path: "src/auth.ts", old_string: "if (token)", new_string: "if (token && !expired)" },
  ],
  Grep: [
    { pattern: "TODO", path: "src/" },
    { pattern: "import.*from.*react", path: "src/components" },
  ],
  Glob: [
    { pattern: "**/*.test.ts" },
    { pattern: "src/**/*.tsx" },
  ],
  Agent: [
    { prompt: "Research the best approach for implementing auth", subagent_type: "Explore" },
    { prompt: "Find all files related to the payment system", subagent_type: "Explore" },
  ],
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSessionEvents(
  session: { id: string; label: string },
  startTime: Date,
  eventCount: number
) {
  const events: {
    $event_type: string;
    $session_id: string;
    $tool_name: string | null;
    $tool_input: string | null;
    $timestamp: string;
    $input_tokens: number | null;
    $output_tokens: number | null;
  }[] = [];

  let currentTime = new Date(startTime);

  // Session start
  events.push({
    $event_type: "session_start",
    $session_id: session.id,
    $tool_name: null,
    $tool_input: null,
    $timestamp: currentTime.toISOString(),
    $input_tokens: null,
    $output_tokens: null,
  });

  // Tool calls
  for (let i = 0; i < eventCount - 2; i++) {
    currentTime = new Date(currentTime.getTime() + (5000 + Math.random() * 40000));

    const tool = randomItem(TOOLS);
    const inputs = SAMPLE_INPUTS[tool];
    const input = inputs ? randomItem(inputs) : null;

    if (tool === "Agent" && Math.random() > 0.5) {
      events.push({
        $event_type: "subagent_start",
        $session_id: session.id,
        $tool_name: "Agent",
        $tool_input: input ? JSON.stringify(input) : null,
        $timestamp: currentTime.toISOString(),
        $input_tokens: Math.floor(500 + Math.random() * 2000),
        $output_tokens: Math.floor(200 + Math.random() * 800),
      });

      currentTime = new Date(currentTime.getTime() + (10000 + Math.random() * 30000));

      events.push({
        $event_type: "subagent_stop",
        $session_id: session.id,
        $tool_name: "Agent",
        $tool_input: null,
        $timestamp: currentTime.toISOString(),
        $input_tokens: Math.floor(1000 + Math.random() * 4000),
        $output_tokens: Math.floor(500 + Math.random() * 2000),
      });
      continue;
    }

    // pre_tool_use
    const inputTokens = Math.floor(200 + Math.random() * 3000);
    const outputTokens = Math.floor(100 + Math.random() * 1500);

    events.push({
      $event_type: "pre_tool_use",
      $session_id: session.id,
      $tool_name: tool,
      $tool_input: input ? JSON.stringify(input) : null,
      $timestamp: currentTime.toISOString(),
      $input_tokens: inputTokens,
      $output_tokens: outputTokens,
    });

    // post_tool_use
    currentTime = new Date(currentTime.getTime() + (500 + Math.random() * 5000));

    events.push({
      $event_type: "post_tool_use",
      $session_id: session.id,
      $tool_name: tool,
      $tool_input: input ? JSON.stringify(input) : null,
      $timestamp: currentTime.toISOString(),
      $input_tokens: inputTokens,
      $output_tokens: outputTokens,
    });
  }

  // Session end
  currentTime = new Date(currentTime.getTime() + 5000);
  events.push({
    $event_type: "session_end",
    $session_id: session.id,
    $tool_name: null,
    $tool_input: null,
    $timestamp: currentTime.toISOString(),
    $input_tokens: null,
    $output_tokens: null,
  });

  return events;
}

const now = new Date();

const allEvents = [
  ...generateSessionEvents(SESSIONS[0], new Date(now.getTime() - 30 * 60000), 25),
  ...generateSessionEvents(SESSIONS[1], new Date(now.getTime() - 20 * 60000), 20),
  ...generateSessionEvents(SESSIONS[2], new Date(now.getTime() - 10 * 60000), 18),
  ...generateSessionEvents(SESSIONS[3], new Date(now.getTime() - 2 * 60000), 8),
];

const insertMany = db.transaction((events: typeof allEvents) => {
  for (const event of events) {
    insertEvent.run(event);
  }
});

insertMany(allEvents);

console.log(`Seeded ${allEvents.length} events across ${SESSIONS.length} sessions`);
