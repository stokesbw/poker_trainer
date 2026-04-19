import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: "#1a4a2e",
          dark: "#122e1d",
          light: "#256037",
        },
        card: {
          red: "#dc2626",
          black: "#1a1a1a",
          bg: "#f8f4e8",
        },
        chip: {
          gold: "#d4af37",
          silver: "#c0c0c0",
        },
        poker: {
          bg: "#0f1923",
          surface: "#1a2535",
          border: "#2a3a4a",
          accent: "#3b82f6",
          green: "#22c55e",
          red: "#ef4444",
          yellow: "#eab308",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "deal-card": "dealCard 0.3s ease-out",
        "chip-stack": "chipStack 0.2s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        dealCard: {
          "0%": { opacity: "0", transform: "scale(0.8) translateY(-20px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        chipStack: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
