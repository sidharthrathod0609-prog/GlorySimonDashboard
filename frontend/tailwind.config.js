/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: 'rgb(var(--gold-light-rgb) / <alpha-value>)',
          DEFAULT: 'rgb(var(--gold-rgb) / <alpha-value>)',
          dark: 'rgb(var(--gold-dark-rgb) / <alpha-value>)',
          accent: 'rgb(var(--gold-accent-rgb) / <alpha-value>)'
        },

        emerald: {
          400: 'rgb(var(--emerald-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--emerald-500-rgb) / <alpha-value>)',
          950: 'rgb(var(--emerald-950-rgb) / <alpha-value>)'
        },
        rose: {
          400: 'rgb(var(--rose-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--rose-500-rgb) / <alpha-value>)',
          950: 'rgb(var(--rose-950-rgb) / <alpha-value>)'
        },
        amber: {
          400: 'rgb(var(--amber-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--amber-500-rgb) / <alpha-value>)',
          950: 'rgb(var(--amber-950-rgb) / <alpha-value>)'
        },
        sky: {
          400: 'rgb(var(--sky-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--sky-500-rgb) / <alpha-value>)',
          950: 'rgb(var(--sky-950-rgb) / <alpha-value>)'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
      }
    },
  },
  plugins: [],
}
