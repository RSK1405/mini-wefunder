/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f0f0f",
        card: "#1a1a1a",
        border: "#2a2a2a",
        paper: "#ffffff",
        muted: "#9ca3af",
        accent: "#c8ff00",
        "green-signal": "#22c55e",
        "red-signal": "#ef4444"
      },
      fontFamily: {
        display: ["system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
};