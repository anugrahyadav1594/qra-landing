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
        // ── Mumbai Trading Tournament palette ──────────────────────────
        arena: {
          950: "#090A0C", // primary background
          900: "#101114", // secondary background
          850: "#141519",
          800: "#17191D", // elevated surface / card
          750: "#1D1F25",
          700: "#23262D",
          600: "#2E313C",
        },
        flare: {
          100: "#FFE9DC",
          200: "#FFD3B8",
          300: "#FF9B55", // warm highlight
          400: "#FF8A40",
          500: "#FF792F", // primary orange
          600: "#E8601A",
          700: "#B4460D",
          800: "#6B2F0E",
        },
        bone: "#F2EFEA", // primary text
        ash: "#99999F", // secondary text
        muted: "#82838A", // tertiary / annotation text (AA on #090A0C; brief value #66676E measured 3.6:1)
      },
      borderColor: {
        hairline: "rgba(255,255,255,0.12)",
        faint: "rgba(255,255,255,0.06)",
      },
      letterSpacing: {
        tightest: "-0.045em",
        brand: "0.22em",
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
        mono: [
          "'JetBrains Mono Variable'",
          "'JetBrains Mono'",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        flare: "0 0 0 1px rgba(244,124,53,0.35), 0 18px 60px -24px rgba(244,124,53,0.55)",
        arena: "0 40px 120px -60px rgba(0,0,0,0.9)",
      },
      keyframes: {
        "ring-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "ring-pulse": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "scan-line": {
          "0%": { transform: "translateX(-110%)" },
          "100%": { transform: "translateX(110%)" },
        },
        "ticker-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "ring-spin": "ring-spin 24s linear infinite",
        "ring-pulse": "ring-pulse 3.4s ease-in-out infinite",
        "scan-line": "scan-line 4.5s cubic-bezier(0.65,0,0.35,1) infinite",
        "ticker-up": "ticker-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
