/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#22c55e", // Vibrant Green
        "primary-hover": "#16a34a", // Darker Green for hover states
        secondary: "#2563eb", // Blue
        "navy-dark": "#04122E", // Deep Trustee Navy
        "navy-light": "#0b1d3d", // Lighter variant for cards/borders in dark sections
        dark: "#1e293b",
        light: "#f8fafc",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
