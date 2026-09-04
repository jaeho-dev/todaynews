/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'SUIT', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(17, 24, 39, 0.04), 0 8px 30px rgba(17, 24, 39, 0.045)',
      },
    },
  },
  plugins: [],
}
