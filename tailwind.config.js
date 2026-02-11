/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Enable class-based dark mode
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      },
      colors: {
        primary: {
          DEFAULT: "#004489", 
          hover: "#003366", 
        },
        secondary: "hsl(140, 70%, 40%)", 
        accent: "hsl(30, 90%, 55%)", 
        neutral: {
          light: "hsl(0, 0%, 95%)",
          dark: "hsl(0, 0%, 20%)",
        },
        // Dark mode specific colors
        dark: {
          background: "#1a202c", // e.g., Tailwind gray-800 or a custom dark
          surface: "#2d3748",    // e.g., Tailwind gray-700 or a custom surface
          text: "#e2e8f0",        // e.g., Tailwind gray-200
          "text-secondary": "#a0aec0", // e.g., Tailwind gray-400
          primary: "#3b82f6", // e.g., Tailwind blue-500
          "primary-hover": "#2563eb", // e.g., Tailwind blue-600
          border: "#4a5568", // e.g., Tailwind gray-600
        }
      },
      borderRadius: {
        container: "0.5rem",
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
