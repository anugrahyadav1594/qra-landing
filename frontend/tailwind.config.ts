import type { Config } from "tailwindcss";

/**
 * Dark-first design system for Quantrelic Analytics.
 *
 * Deep navy surfaces, white typography and three meaningful accents:
 * cobalt blue (information / action), emerald (positive financial movement)
 * and amber (attention / context). No neon, no purple, no glassmorphism.
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
        ink: {
          950: "#070B14", // page background
          900: "#0D1320", // raised section background
          850: "#111827", // panels
          800: "#151D2B", // elevated panels
          750: "#1B2434", // hover / inset
          700: "#232E42", // borders strong, chips
        },
        paper: {
          DEFAULT: "#F5F7FA", // primary text
          dim: "#9AA6B8", // secondary text
          mute: "#8B98AC", // tertiary text (contrast-safe on ink-950)
          faint: "#6F7C91", // micro labels, decorations
        },
        brand: {
          300: "#9DB1FF",
          400: "#6E8CFF",
          500: "#3B66FF", // primary accent
          600: "#2F55E0",
          700: "#2545BE",
        },
        positive: {
          DEFAULT: "#20C997",
          300: "#5FDDB6",
          700: "#0F7A5C",
        },
        amber: {
          DEFAULT: "#F5B942",
          300: "#FFD27A",
        },
        danger: {
          DEFAULT: "#FF6B6B",
        },
        line: {
          DEFAULT: "rgba(245, 247, 250, 0.10)",
          strong: "rgba(245, 247, 250, 0.18)",
          faint: "rgba(245, 247, 250, 0.06)",
        },
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
        tightest: "-0.04em",
        microl: "0.22em",
      },
      maxWidth: {
        shell: "1200px",
        contact: "1100px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      boxShadow: {
        panel: "0 30px 60px -40px rgba(0, 0, 0, 0.9)",
        glow: "0 0 0 1px rgba(59, 102, 255, 0.25), 0 24px 60px -30px rgba(59, 102, 255, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
