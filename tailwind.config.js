/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // ✅ Active le mode sombre via une classe
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563eb",
          light: "#3b82f6",
          dark: "#1e40af",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
}
