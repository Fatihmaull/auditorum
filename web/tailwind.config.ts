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
          50: "#EBF0FA",
          100: "#C9D7F0",
          500: "#0B3D91",
          600: "#092e6e",
          700: "#081f4a",
        },
        beige: "#EAE3D2",
        surface: "#FAFAF8",
      },
    },
  },
  plugins: [],
};
export default config;
