/** @type {import('tailwindcss').Config} */
export default {
  content: [    
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    colors: {
      'noct-teal': '#5AC3B5',
      'noct-blue': '#2C87BE',
      'noct-orange': '#DEA956',
      'noct-black': '#222426',
      'noct-gray': {
        100: '#333435',
        200: '#47494a',
        300: '#5b5e60',
        400: '#707375 ',
        500: '#66696B', // base color
        600: '#84888b', // Darker shade
      },
      'noct-white': '#E7ECF1',
    },
    fontFamily: {
      'termina': ['"Termina"', 'sans-serif'],
    },
    extend: {
      whitespace: {
        'pre': 'pre',
      },
      boxShadow: {
        'in-around': 'inset 0 4px 12px 0 rgb(0 0 0 / 0.05)',
        'out-around': '0 4px 12px 0 rgb(0 0 0 / 0.05)',
        'custom': '0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -1px rgba(255, 255, 255, 0.06)', // Custom light shadow for dark backgrounds
      },
      width: {
        'square': '4rem',
      },
      height: {
        'square': '4rem',
      },
      backgroundColor: {
        'black-square': '#66696B',
        'white-square': '#E7ECF1',
        'graveyard': '#DEA956',
      },
      textColor: {
        'black-square': 'white',
        'white-square': 'black',
      },
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [ require('@tailwindcss/forms') ],
}

