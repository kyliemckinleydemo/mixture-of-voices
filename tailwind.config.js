/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'engine-pulse': 'engine-pulse 1.5s ease-in-out infinite',
        'brain-pulse': 'brain-pulse 1s ease-in-out infinite',
        'selected-glow': 'selected-engine-glow 2s ease-in-out infinite',
        'selection-flash': 'engine-selection-flash 0.5s ease-in-out 3',
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'engine-pulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '0.8',
          },
        },
        'brain-pulse': {
          '0%, 100%': {
            transform: 'scale(1) rotate(0deg)',
            opacity: '1',
          },
          '25%': {
            transform: 'scale(1.1) rotate(-2deg)',
            opacity: '0.9',
          },
          '50%': {
            transform: 'scale(1.15) rotate(0deg)',
            opacity: '0.8',
          },
          '75%': {
            transform: 'scale(1.1) rotate(2deg)',
            opacity: '0.9',
          },
        },
        'selected-engine-glow': {
          '0%, 100%': {
            boxShadow: '0 0 0 2px rgba(147, 51, 234, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 0 4px rgba(147, 51, 234, 0.5), 0 0 20px rgba(147, 51, 234, 0.2)',
          },
        },
        'engine-selection-flash': {
          '0%': {
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
          },
          '50%': {
            backgroundColor: 'rgba(147, 51, 234, 0.3)',
          },
          '100%': {
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
          },
        },
        spin: {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}