import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15192B",
        panel: "#F6F4EE",
        slate: "#5B6B8C",
        amber: "#C8841B",
        amberSoft: "#F2DDB3",
        ok: "#3F7A5C",
        bad: "#B23A48",
        line: "#DAD4C3",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
