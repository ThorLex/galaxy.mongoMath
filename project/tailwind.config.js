/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'forest': {
          50: '#f3faf7',
          100: '#def7ec',
          200: '#bcf0da',
          300: '#84e1bc',
          400: '#31c48d',
          500: '#0e9f6e',
          600: '#057a55',
          700: '#046c4e',
          800: '#03543f',
          900: '#014737',
        },
      },
    },
  },
  plugins: [],
};