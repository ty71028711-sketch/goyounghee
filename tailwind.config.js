/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './auth/**/*.{js,ts,jsx,tsx,mdx}',
    './core/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto)', 'system-ui', '-apple-system', 'sans-serif'],
        bhs:  ['var(--font-bhs)', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn .2s ease both',
        'slide-up': 'slideUp .22s ease both',
        'modal-up': 'modalUp .32s cubic-bezier(0.32,0.72,0,1) both',
        'pulse-dot':'pulseDot 2s ease-in-out infinite',
        'progress': 'progress 1s ease-in-out forwards',
        'fade-in-up': 'fadeInUp .4s ease both',
      },
      keyframes: {
        fadeIn:    { from:{ opacity:'0' }, to:{ opacity:'1' } },
        slideUp:   { from:{ opacity:'0', transform:'translateY(14px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        modalUp:   { from:{ transform:'translateY(100%)' }, to:{ transform:'translateY(0)' } },
        pulseDot:  { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'.3' } },
        progress:  { from:{ width:'0%' }, to:{ width:'100%' } },
        fadeInUp:  { from:{ opacity:'0', transform:'translateY(20px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
