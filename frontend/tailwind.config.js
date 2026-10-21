/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Teko', 'Impact', 'sans-serif'],
        body: ['Rajdhani', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        ember: {
          50: '#fff5ed',
          100: '#ffe8d4',
          200: '#fecca8',
          300: '#fda671',
          400: '#fb7a38',
          500: '#ff5f1f',
          600: '#f04a0c',
          700: '#c73a0c',
          800: '#9e3012',
          900: '#7f2a12',
          950: '#451204',
        },
        ash: {
          50: '#f6f6f7',
          100: '#e2e2e5',
          200: '#c6c6cb',
          300: '#a1a1a8',
          400: '#7a7a83',
          500: '#5c5c64',
          600: '#47474e',
          700: '#37373d',
          800: '#232327',
          900: '#151518',
          950: '#0b0b0d',
        },
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1.05) translate(0, 0)' },
          '50%': { transform: 'scale(1.15) translate(-1.5%, -1.5%)' },
          '100%': { transform: 'scale(1.05) translate(0, 0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 95, 31, 0.45)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255, 95, 31, 0)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '45%': { opacity: '0.85' },
          '55%': { opacity: '1' },
          '70%': { opacity: '0.9' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'ken-burns': 'ken-burns 22s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.2s ease-out infinite',
        flicker: 'flicker 3s linear infinite',
        marquee: 'marquee 26s linear infinite',
      },
    },
  },
  plugins: [],
};
