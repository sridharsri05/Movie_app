/** @type {import('tailwindcss').Config} */
// import flowbitePlugin from 'flowbite/plugin';
import defaultTheme from 'tailwindcss/defaultTheme';


export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        white: "#fff",
        palevioletred: "#a93159",
        steelblue: "#465685",
        silver: "#bcbec0",
        lightslategray: "#798995",
        darkslategray: "#414042",
        aliceblue: "#e2eef5",
      },
      borderRadius: {
        "21xl": "40px",
      },
      screens: {
        's': '320px',
        'm': '375px',
        'l': '425px',
        '3xl': '2560px',
        ...defaultTheme.screens,

      },
      fontFamily: {
        libre: ['"Poppins"', ...defaultTheme.fontFamily.sans], gilroy: "Gilroy",
      }
    },

  },
  plugins: [
    // flowbitePlugin(),


  ],
}