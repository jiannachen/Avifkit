import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#0a0a0a',
      slate: {
        50: '#f5f5f5',
        100: '#efefef',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a1a1a1',
        500: '#737373',
        600: '#666666',
        700: '#525252',
        800: '#404040',
        900: '#171717',
        950: '#0a0a0a',
      },
      blue: {
        50: '#d7defd',
        100: '#c6d2ff',
        200: '#a6a5fe',
        300: '#8b87fc',
        400: '#6b5df8',
        500: '#4f39f6',
        600: '#432dd7',
        700: '#312c85',
        800: '#28266b',
        900: '#1f1d55',
        950: '#15143e',
      },
      indigo: {
        50: '#d7defd',
        100: '#c6d2ff',
        200: '#a6a5fe',
        300: '#8b87fc',
        400: '#6b5df8',
        500: '#4f39f6',
        600: '#432dd7',
        700: '#312c85',
        800: '#28266b',
        900: '#1f1d55',
        950: '#15143e',
      },
      emerald: {
        50: '#e8fff1',
        100: '#c9f7dc',
        200: '#8eeab2',
        300: '#4ddd84',
        400: '#1bd062',
        500: '#00c950',
        600: '#00a844',
        700: '#087a38',
        800: '#126231',
        900: '#124e2a',
        950: '#082d18',
      },
      green: {
        50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80',
        500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16',
      },
      yellow: {
        50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15',
        500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006',
      },
      red: {
        50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171',
        500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a',
      },
      amber: {
        50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
        500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Marund', 'var(--font-newsreader)', 'Newsreader', 'Georgia', 'serif'],
      },
      fontWeight: {
        bold: '600',
      },
      maxWidth: {
        '7xl': '1200px',
      },
      borderRadius: {
        md: '6px',
        lg: '6px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        sm: 'inset 0 0 2px rgb(0 0 0 / 0.18), inset 0 1px 0 rgb(0 0 0 / 0.06)',
        md: '0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10)',
        xl: '0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10)',
        '2xl': '0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10)',
      },
      colors: {
        primary: {
          50: '#d7defd',
          100: '#c6d2ff',
          500: '#4f39f6',
          600: '#432dd7',
          700: '#312c85',
        },
        brand: {
          black: '#0a0a0a',
          gray: '#525252',
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
