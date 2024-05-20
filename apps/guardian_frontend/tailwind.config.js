/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('../../tailwind.config.js')],
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        secondary: '#212B36',
        warning: '#FFB612',
        error: '#FF4842',
        blue: {
          DEFAULT: '#3366FF',
          100: '#4A5CFF',
          700: '#2F2966',
          800: '#14208C',
        },
        gray: {
          DEFAULT: '#637381',
          50: '#C9C9C9',
          100: '#8B8B8B',
          200: '#7E83B0',
          300: '#57537A',
          500: '#667085',
          600: '#637381',
          900: '#333338',
        },
        purple: {
          DEFAULT: '#513FFF',
        },
      },
      borderRadius: {
        '1.5xl': '0.875rem',
      },
      boxShadow: {
        inputShadow: '0px 2px 30px 0px #E3E0FF',
        hoverInputShadow: '0px 2px 30px 0px #C1BCF2B2',
        card: '0px 12px 24px -4px #919EAB1F',
        selectRFC: '0 20px 40px -4px rgba(145, 158, 171, 0.16)',
      },
      backgroundImage: {
        'checkbox-tick': "url('/icons/checkbox-tick.svg')",
        'gradient-mobile': "url('/images/gradient-home-mobile.svg')",
        'gradient-desktop': "url('/images/gradient-home-desktop.svg')",
      },
      keyframes: {
        'accordion-slide-down': {
          from: { maxHeight: 1000 },
          to: { maxHeight: 0 },
        },
        'accordion-slide-up': {
          from: { maxHeight: 0 },
          to: { maxHeight: 1000 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'fade-out': {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
      },
      animation: {
        'accordion-slide-down': 'accordion-slide-down 500ms cubic-bezier(0.87, 0, 0.13, 1)',
        'accordion-slide-up': 'accordion-slide-up 500ms cubic-bezier(0.87, 0, 0.13, 1)',
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 200ms ease-out',
      },
    },
  },
};
