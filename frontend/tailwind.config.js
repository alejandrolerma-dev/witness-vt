/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1a1f36',
        'navy-light': '#252b4a',
        'navy-card': '#2d3561',
        brand: '#6366f1',
        'brand-light': '#818cf8',
        'brand-dark': '#4f46e5',
        safe: '#10b981',
        'safe-light': '#d1fae5',
        'safe-dark': '#065f46',
        warm: '#f8f7ff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)',
        glow: '0 0 32px rgba(99,102,241,0.25)',
      },
    },
  },
  plugins: [],
}
