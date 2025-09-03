/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        // Default breakpoints: sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minWidth: {
        '44': '44px', // Minimum touch target size
      },
      minHeight: {
        '44': '44px', // Minimum touch target size
      },
    },
  },
  plugins: [],
};
