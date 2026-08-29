import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#05070a",
          900: "#0a0e14",
          850: "#0d121a",
          800: "#111823",
          700: "#1a2330",
          600: "#26313f",
          500: "#3a4a5c",
        },
        accent: {
          DEFAULT: "#2dd4bf",
          dim: "#0f766e",
          bright: "#5eead4",
        },
        warn: {
          DEFAULT: "#f59e0b",
        },
        danger: {
          DEFAULT: "#f43f5e",
        },
        ok: {
          DEFAULT: "#22c55e",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
