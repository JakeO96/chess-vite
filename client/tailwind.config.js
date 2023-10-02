/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {
      whitespace: {
        'pre': 'pre',
      },
      boxShadow: {
        'in-around': 'inset 0 4px 12px 0 rgb(0 0 0 / 0.05)',
        'out-around': '0 4px 12px 0 rgb(0 0 0 / 0.05)'
      },
      backgroundImage: {
      }
    },
    fontFamily: {
      'termina': ['"Termina"', 'sans-serif'],
    },
    colors: {
      'noct-teal': '#5AC3B5',
      'noct-blue': '#2C87BE',
      'noct-orange': '#DEA956',
      'noct-black': '#222426',
      'noct-gray': '#66696B',
      'noct-white': '#E7ECF1',
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '993.3333px',
      'xl': '1280px',
      '2xl': '1536px',
      'max': '1920px',
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
  plugins: [
      // eslint-disable-next-line no-undef
      require('@tailwindcss/forms')
  ],
}

