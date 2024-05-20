/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('../../tailwind.config.js')],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/layouts/**/*.{js,ts,jsx,tsx}',
    './src/sections/**/*.{js,ts,jsx,tsx}',
    './src/utils/**/*.{js,ts,jsx,tsx}',
    './src/guards/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'blue-secondary-200': '#3366FF',
        'blue-secondary-300': 'rgba(24, 144, 255, 1)',

        primary: '#DBE0E4',
        secondary: '#212B36',
        error: 'rgba(var(--color-danger), <alpha-value>)',
        warning: '#FFC107',
        info: '#1890FF',
        successBg: '#54D62C29',
        successText: '#229A16',
        scheduledText: '#1890FF',
        processingText: '#B78103',
        green: { DEFAULT: '#00AB55', 800: '#007B55' },
        gray: {
          100: '#F5FAFF',
          200: '#F4F6F8',
          400: '#C4CDD5',
          500: '#919EAB',
          600: '#637381',
          700: '#454F5B',
        },
        yellow: { 200: '#FFF7CD', 700: '#7A4F01' },
        blue: { 200: '#D0F2FF', 700: '#04297A', 800: '#1939B7', custom: '#3366FF14', secondary: '#3366FF' },
        red: { 200: '#ffcdd2', 700: '#c62828' },
        label: {
          high: 'rgba(255, 72, 66, 0.12)',
          medium: '#FFEACB',
          low: 'rgba(255, 193, 7, 0.24)',
          none: 'rgba(84, 214, 44, 0.08)',
        },
      },
      screens: {
        '2lg': '1200px',
        '3xl': '1920px',
      },
      boxShadow: {
        slider: '0 0 0 5px rgba(0, 0, 0, 0.3)',
        card: '0px 0px 2px rgba(145, 158, 171, 0.2), 0px 12px 24px -4px rgba(145, 158, 171, 0.12)',
        cardBottom: '0px -12px 24px -4px rgba(145, 158, 171, 0.12)',
        cardStrong: '0px 24px 48px 0px rgba(145, 158, 171, 0.16)',
        button: '0px 8px 16px 0px rgba(51, 102, 255, 0.24)',
        table: '0px 15px 41px -12px rgba(8,8,8,0.75)',
        backgroundDownload: '0px 0px 2px rgba(145, 158, 171, 0.2), 0px -12px 24px -4px rgba(145, 158, 171, 0.12)',
        inputShadow: '0px 2px 30px 0px #E3E0FF',
        hoverInputShadow: '0px 2px 30px 0px #C1BCF2B2',
        greenButton: '0px 8px 16px 0px #00AB553D',
        green: '0 0 0 1px #01AB55',
        conceptButton: '4px 4px 20px 0px #71799330',
      },
      keyframes: {
        slideUpAndFade: {
          from: { opacity: 0, transform: 'translateY(2px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        // Dropdown menu
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideDown: {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        slideUp: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        show: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'fade-out': {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        'slide-in-right': {
          from: { transform: 'translate3d(100%,0,0)' },
          to: { transform: 'translate3d(0,0,0)' },
        },
        'slide-out-right': {
          from: { transform: 'translate3d(0,0,0)' },
          to: { transform: 'translate3d(100%,0,0)' },
        },
        'slide-in-left': {
          from: { transform: 'translate3d(-100%,0,0)' },
          to: { transform: 'translate3d(0,0,0)' },
        },
        'slide-out-left': {
          from: { transform: 'translate3d(0,0,0)' },
          to: { transform: 'translate3d(-100%,0,0)' },
        },
        'bounce-x': {
          '0%, 100%': {
            transform: 'translateX(0%)',
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateX(-3%)',
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        destroy: {
          '0%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(0.5) rotate(180deg)' },
          '100%': { opacity: '0', transform: 'scale(0) rotate(360deg)' },
        },
      },
      animation: {
        // Dropdown menu
        'scale-in': 'scale-in 0.2s ease-in-out',
        'slide-down': 'slide-down 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        show: 'show 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-out-right': 'slide-out-right 150ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-in-right': 'slide-in-right 150ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-in-left': 'slide-in-left 150ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-out-left': 'slide-in-left 150ms cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 200ms ease-out',
        slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-x': 'bounce-x 1.5s 2',
        slideDown: 'slideDown 200ms cubic-bezier(0.87, 0, 0.13, 1)',
        slideUp: 'slideUp 200ms cubic-bezier(0.87, 0, 0.13, 1)',
        destroy: 'destroy 0.5s ease forwards',
      },
      opacity: {
        8: '.08',
        12: '.12',
        15: '.15',
        24: '.24',
        16: '.16',
        48: '.48',
      },
      ripple: (theme) => ({
        colors: theme('colors'),
        activeTransition: 'background 0.3s ease-in-out',
      }),
    },
  },
};
