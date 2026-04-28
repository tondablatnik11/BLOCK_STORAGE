/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: "#050a18",
        surface: "#0a1628",
        panel: "#0d1b2a",
        neon: {
          blue: "#3b82f6",
          purple: "#8b5cf6",
          green: "#10b981",
          red: "#ef4444",
          orange: "#f59e0b"
        }
      },
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
