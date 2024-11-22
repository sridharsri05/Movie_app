/** @type {import('tailwindcss').Config} */
import { Variants } from 'antd/es/config-provider';
import { extend } from 'lodash';
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
      scrollSnapType: {
        x: "x mandatory",
      },
      scrollSnapAlign: {
        start: "start",
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
      },
      gridColumn: {
        'span-1.5': 'span 1.5 / span 1.5',
      },
      perspective: {
        none: 'none',
        250: '250px',
        500: '500px',
        1000: '1000px',
        1500: '1500px',
      },
    },

  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.perspective-none': {
          perspective: 'none',
        },
        '.perspective-250': {
          perspective: '250px',
        },
        '.perspective-500': {
          perspective: '500px',
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.perspective-1500': {
          perspective: '1500px',
        },
        '.perspective-origin-center': {
          'perspective-origin': 'center',
        },
        '.perspective-origin-top': {
          'perspective-origin': 'top',
        },
        '.perspective-origin-bottom': {
          'perspective-origin': 'bottom',
        },
      };

      addUtilities(newUtilities);
    },

  ],
  Variants:{
    extend:{
      scrollSnapType: ["responsive"],
      scrollSnapAlign: ["responsive"],
    }
  }
}