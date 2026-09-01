/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B1220",
        surface: "#121B2E",
        surface2: "#182238",
        border: "#243049",
        teal: {
          DEFAULT: "#2DD4BF",
          dim: "#1F9A8C",
        },
        amber: "#F5A623",
        danger: "#EF5A5A",
        text: {
          DEFAULT: "#E7ECF3",
          muted: "#8B97AB",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        panel: "0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
