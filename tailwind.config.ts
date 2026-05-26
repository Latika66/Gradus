import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "neon-blue": "#00d4ff",
        "neon-purple": "#7928ca",
        "neon-cyan": "#00fff0",
        "neon-green": "#00ff94",
        "neon-orange": "#ff6b00",
        "dark-bg": "#050816",
        "dark-card": "#0d1b2a",
        "dark-border": "#1a2942",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
            borderColor: "rgba(0, 212, 255, 0.3)",
          },
          "50%": {
            boxShadow:
              "0 0 40px rgba(0, 212, 255, 0.7), 0 0 80px rgba(0, 212, 255, 0.2)",
            borderColor: "rgba(0, 212, 255, 0.8)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "rotate-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "node-unlock": {
          "0%": {
            transform: "scale(0.8)",
            boxShadow: "0 0 0 rgba(0, 212, 255, 0)",
          },
          "50%": {
            transform: "scale(1.15)",
            boxShadow: "0 0 40px rgba(0, 212, 255, 0.8)",
          },
          "100%": {
            transform: "scale(1)",
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.4)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
