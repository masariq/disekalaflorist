/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        florist: {
          50: '#fdf6f9',
          100: '#fae9f1',
          200: '#f5d3e3',
          300: '#eeb1ca',
          400: '#e387a8',
          500: '#d65f87',
          600: '#c0446d',
          700: '#9e3558',
          800: '#832e4b',
          900: '#6e2940',
        },
        sage: {
          50: '#f5f8f4',
          100: '#e8f0e5',
          200: '#cfe0ca',
          300: '#a9c4a1',
          400: '#7fa474',
          500: '#5d8654',
          600: '#486b41',
          700: '#3a5635',
          800: '#30462d',
          900: '#283a27',
        },
        cream: {
          50: '#fdfbf7',
          100: '#faf5ea',
          200: '#f4e9d1',
          300: '#ead7b0',
          400: '#ddbf88',
          500: '#cda663',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(214, 95, 135, 0.08)',
        card: '0 4px 24px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
