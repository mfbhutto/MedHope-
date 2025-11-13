/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#34D399',
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        golden: {
          light: '#FCD34D',
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        white: {
          DEFAULT: '#FFFFFF',
          off: '#F9FAFB',
        },
      },
    },
  },
  plugins: [],
}

