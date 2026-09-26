import type { Config } from "tailwindcss";

/**
 * Editorial financial technology palette.
 *
 * Warm off-white canvas, deep navy/charcoal text, one restrained blue accent
 * and a muted green used only for positive financial context. No neon, no
 * gradients as a primary language, no glassmorphism.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#F7F6F2",
          raised: "#FFFFFF",
          sunken: "#F2F0EA",
          deep: "#EDEAE2",
        },
        ink: {
          DEFAULT: "#101828",
          900: "#101828",
          800: "#1D2939",
          700: "#344054",
          600: "#475467",
        },
        muted: {
          DEFAULT: "#667085",
          400: "#98A2B3",
          200: "#D0D5DD",
        },
        accent: {
          DEFAULT: "#3157D5",
          700: "#274AB8",
          600: "#2C4EC4",
          200: "#C9D3F6",
          100: "#DFE5FB",
          50: "#EFF2FD",
        },
        positive: {
          DEFAULT: "#16805C",
          100: "#D8EFE6",
          50: "#EEF7F3",
        },
        caution: {
          DEFAULT: "#B54708",
          100: "#FAEBDD",
          50: "#FDF6EF",
        },
      },
      borderColor: {
        DEFAULT: "rgba(16, 24, 40, 0.10)",
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
      letterSpacing: {
        tightest: "-0.035em",
      },
      maxWidth: {
        shell: "1152px",
        contact: "1100px",
        measure: "68ch",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.03)",
        panel: "0 24px 48px -32px rgba(16, 24, 40, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
