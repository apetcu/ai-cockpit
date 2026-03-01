import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#111111",
        elevated: "#1a1a1a",
        foreground: {
          DEFAULT: "#e8e8e8",
          muted: "#888888",
          subtle: "#555555",
        },
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          hover: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.08)",
          "border-hover": "rgba(255, 255, 255, 0.15)",
        },
        accent: {
          DEFAULT: "#008B8B",
          hover: "#00a5a5",
          muted: "rgba(0, 139, 139, 0.15)",
          glow: "rgba(0, 139, 139, 0.25)",
        },
        border: "rgba(255, 255, 255, 0.06)",
        tool: {
          bash: "#008B8B",
          read: "#64748b",
          write: "#b8860b",
          edit: "#7c3aed",
          grep: "#475569",
          glob: "#475569",
          agent: "rgba(255, 255, 255, 0.7)",
        },
      },
      fontFamily: {
        display: ["'JetBrains Mono'", "ui-monospace", "monospace"],
        body: ["system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
