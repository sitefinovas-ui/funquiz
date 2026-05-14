/** @type {import('tailwindcss').Config} */
export default {
  important: true,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette violette principale
        purple: {
          lighter: '#d1b3ff',
          light: '#b597f9',
          medium: 'rgb(190, 91, 220)',
          dark: 'rgb(134, 20, 168)',
          darker: 'rgb(88, 8, 113)',
          deep: '#350558',
          royal: '#230539',
        },
        pink: {
          DEFAULT: 'rgb(243, 19, 176)',
          dark: '#d100d1',
        },
        site: {
          bg: '#0d0d19',
          accent: '#9b34d3',
          text: '#ffffff',
          muted: '#a0a9c0',
          link: '#4ea1ff',
          surface: 'rgba(255,255,255,0.06)',
          border: 'rgba(255,255,255,0.12)',
        },
      },
      fontFamily: {
        gantari: ['Gantari', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        lexend: ['Lexend', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, rgb(88,8,113), rgba(155,48,255,1), rgb(243,19,176))',
        'gradient-footer': 'linear-gradient(145deg, #350558, #230539)',
        'gradient-hero': 'radial-gradient(ellipse at 50% 0%, rgba(155,48,255,0.25) 0%, transparent 70%)',
      },
      animation: {
        'gradient-shift': 'gradientShift 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(155,52,211,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(155,52,211,0.8), 0 0 80px rgba(155,52,211,0.3)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-purple': '0 0 30px rgba(155,52,211,0.5)',
        'glow-pink': '0 0 30px rgba(243,19,176,0.5)',
        'card': '0 25px 50px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 35px 60px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)',
      },
    },
  },
  plugins: [],
};
