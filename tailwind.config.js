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
          light: '#17A2A4',
          DEFAULT: '#0A5E63',
          dark: '#084A4E',
        },
        secondary: {
          DEFAULT: '#F2F9F9',
          light: '#F8FCFC',
        },
        accent: {
          DEFAULT: '#F97316',
          light: '#FB923C',
          dark: '#EA580C',
        },
        dark: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
        },
        gray: {
          soft: '#EEF4F6',
          light: '#F8FAFC',
          DEFAULT: '#64748B',
          dark: '#475569',
        },
        // Keep golden for backward compatibility
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
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0A5E63 0%, #17A2A4 100%)',
        'gradient-hero': 'linear-gradient(135deg, #17A2A4 0%, #0A5E63 50%, #F2F9F9 100%)',
        'gradient-soft': 'linear-gradient(135deg, #F2F9F9 0%, #FFFFFF 100%)',
        'gradient-warm': 'linear-gradient(135deg, #F2F9F9 0%, #EEF4F6 100%)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(10, 94, 99, 0.08), 0 10px 20px -2px rgba(10, 94, 99, 0.04)',
        'medium': '0 4px 25px -5px rgba(10, 94, 99, 0.1), 0 10px 30px -5px rgba(10, 94, 99, 0.04)',
        'large': '0 10px 40px -10px rgba(10, 94, 99, 0.15), 0 20px 50px -10px rgba(10, 94, 99, 0.08)',
        'glow': '0 0 20px rgba(23, 162, 164, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-in',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
