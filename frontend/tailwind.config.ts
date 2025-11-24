import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Sans Pro"', 'sans-serif'],
        display: ['"Freight Big Pro"', 'serif'],
      },
      colors: {
        'gran-sky': '#E0F2FE',
      },
    },
  },
  plugins: [],
};

export default config;
