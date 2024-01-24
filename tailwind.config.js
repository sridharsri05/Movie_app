/** @type {import('tailwindcss').Config} */
import flowbitePlugin from 'flowbite/plugin';
import defaultTheme from 'tailwindcss/defaultTheme';


export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js',
  ],
  theme: {
    extend: {
      screens: {
        's': '320px',
        'm': '375px',
        'l': '425px',


      },
      fontFamily: {
        libre: ['"Poppins"', ...defaultTheme.fontFamily.sans]
      }
    },
  },
  plugins: [
    flowbitePlugin(),


  ],
}