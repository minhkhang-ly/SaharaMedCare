/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: {
      clinical: '#F4F7FA',
      medical: { primary: '#005B9F', secondary: '#0D9488', success: '#047857', warning: '#B45309', danger: '#B91C1C', surface: '#FFFFFF', background: '#F4F7FA', border: '#E2E8F0' },
      brand: { 50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD', 400: '#60A5FA', 500: '#0284C7', 600: '#005B9F', 700: '#004B83', 800: '#0F3B5D', 900: '#0F172A' }
    },
    fontFamily: { sans: ['Be Vietnam Pro', 'system-ui', 'sans-serif'], display: ['Outfit', 'Be Vietnam Pro', 'sans-serif'] },
    boxShadow: { glass: '0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.035)', neon: '0 1px 3px rgba(15,23,42,.08)' }
  } },
  plugins: []
};
