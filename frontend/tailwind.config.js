/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eoc: {
          darkest: '#090d16',
          darker: '#0f172a',
          card: '#161f33',
          border: '#24324f',
          muted: '#64748b',
          accent: '#38bdf8',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Playfair Display', 'Instrument Serif', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
