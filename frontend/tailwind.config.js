/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        dark: {
          900: '#070A11',
          800: '#0B0F19',
          700: '#111827',
          600: '#1F2937',
          500: '#374151',
        },
        n8n: {
          coral: '#FF6D5A',
          purple: '#7057FF',
          cyan: '#00D4B2',
          amber: '#F59E0B',
          red: '#EF4444',
          emerald: '#10B981',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 178, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 178, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
