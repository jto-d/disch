import type { Config } from "tailwindcss";

// Design tokens extracted directly from Disch Market.html. The CSS variable
// names are kept identical to the prototype so component styling reads the
// same as the reference. Tailwind utilities map onto those vars.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        fg: "var(--fg)",
        fg2: "var(--fg2)",
        fg3: "var(--fg3)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        "accent-mid": "var(--accent-mid)",
        red: "var(--red)",
        "red-dim": "var(--red-dim)",
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'DM Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Mirrors the design's type scale.
        display: ["32px", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "800" }],
        heading: ["22px", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "800" }],
        cardq: ["16px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "700" }],
      },
      borderRadius: {
        card: "14px",
        btn: "12px",
        sm2: "10px",
        xs2: "4px",
      },
      boxShadow: {
        chip: "0 2px 8px rgba(0,0,0,0.06)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.85)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(-12px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "toast-out": {
          from: { opacity: "1", transform: "translateY(0) scale(1)" },
          to: { opacity: "0", transform: "translateY(-8px) scale(0.97)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
        "slide-up": "slide-up 0.25s ease both",
        "fade-in": "fade-in 0.2s ease both",
        "toast-in": "toast-in 0.25s ease both",
        "toast-out": "toast-out 0.35s ease both",
      },
    },
  },
  plugins: [],
} satisfies Config;
