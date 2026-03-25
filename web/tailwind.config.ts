import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          900: "#312e81",
        },
        dark: {
          900: "#0f1115",
          800: "#161b22",
          700: "#21262d",
          600: "#30363d",
        },
        neon: {
          blue: "#38bdf8",
          cyan: "#22d3ee",
        },
      },
    },
  },
  plugins: [],
};
export default config;
