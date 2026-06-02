/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          1: 'var(--bg-surface-1)',
          2: 'var(--bg-surface-2)',
          3: 'var(--bg-surface-3)',
        },
        slate: {
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          blue:   'var(--accent-blue)',
          purple: 'var(--accent-purple)',
          cyan:   'var(--accent-cyan)',
          green:  'var(--accent-green)',
          orange: 'var(--accent-orange)',
        },
      },
      animation: {
        'spin-slow': 'spin 1.2s linear infinite',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
        'slide-in': 'slideIn .3s ease',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%':   { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        glow: {
          '0%,100%': { boxShadow: '0 0 16px rgba(96,165,250,.2)' },
          '50%':     { boxShadow: '0 0 36px rgba(96,165,250,.55)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
