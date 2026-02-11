/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: [
          "Work Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      colors: {
        // T3 Chat Color Scheme
        plum: {
          50: "#f5f0f5",
          100: "#ebe0eb",
          200: "#d6c1d6",
          300: "#b388a3",
          400: "#9a6b89",
          500: "#7d4e6d",
          600: "#5f3a52",
          700: "#4a1d2e",
          800: "#3d1826",
          900: "#2d121c",
        },
        // Dark backgrounds
        dark: {
          bg: "#1A161E",
          sidebar: "#141116",
          surface: "#211C24",
          "surface-elevated": "#2d2533",
          "surface-hover": "#362d3d",
        },
        // Text colors
        text: {
          primary: "#E0E0E0",
          secondary: "#A0A0A0",
          muted: "#6b6b6b",
        },
        // Border colors
        border: {
          DEFAULT: "#3E3942",
          light: "#4a4450",
        },
        // Semantic colors (muted)
        crimson: {
          DEFAULT: "#4A1D2E",
          hover: "#5a2539",
          light: "#6b2f45",
        },
        // Light theme colors (complementary)
        light: {
          bg: "#faf8fa",
          surface: "#ffffff",
          "surface-elevated": "#f5f2f5",
          border: "#e5e0e5",
          text: "#2d2d2d",
          "text-secondary": "#666666",
        },
        // Keep rose for light mode accents
        rose: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
      },
      borderRadius: {
        container: "1rem",
        button: "0.75rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "scale-in": "scaleIn 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.3)",
        "soft-lg": "0 10px 40px -4px rgba(0, 0, 0, 0.4)",
        glow: "0 0 20px rgba(179, 136, 163, 0.2)",
        "glow-lg": "0 0 40px rgba(179, 136, 163, 0.3)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
