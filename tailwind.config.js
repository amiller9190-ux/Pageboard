/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          obsidian: '#0B0B0F',
          charcoal: '#1A1A24',
          gold: '#F5C842',
          'gold-dim': '#C4A020',
        },
      },
    },
  },
  plugins: [],
};
