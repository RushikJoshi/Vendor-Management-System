/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'corp': {
          'dark': '#0B5D3B',
          'secondary': '#117A4F',
          'light': '#E8F5EE',
          'text': '#1F2937',
          'border': '#E5E7EB',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },

      borderRadius: {
        'enterprise': '10px',
      }
    },
  },
  plugins: [],
};