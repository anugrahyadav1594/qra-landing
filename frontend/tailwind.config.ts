import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080C",
          900: "#0B0D12",
          850: "#0E1118",
          800: "#12151D",
          750: "#161A24",
          700: "#1B202C",
          600: "#242B3A",
        },
        paper: {
          DEFAULT: "#F2F0E9",
          dim: "#C9CCD4",
        },
        signal: {
          300: "#8FA3FF",
          400: "#6E87FF",
          500: "#4C6FFF",
          600: "#3D55D6",
          700: "#33449F",
        },
        aqua: {
          300: "#6FE3F0",
          400: "#3ED0E0",
          500: "#22B7C9",
        },
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      fontFamily: {
        sans: [
          "'Inter Variable'",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "'Space Grotesk Variable'",
          "Space Grotesk",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
