const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'purple-blockstack': '#211F6D'
      },
      spacing: {
        '7': '1.75rem',
        '11': '2.75rem',
        '14': '3.5rem',
        '28': '7rem',
        '36': '9rem',
        '72': '18rem',
        '96': '24rem',
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
        '1/4': '25%',
        '2/4': '50%',
        '3/4': '75%',
        '1/5': '20%',
        '2/5': '40%',
        '3/5': '60%',
        '4/5': '80%',
        '1/6': '16.666667%',
        '2/6': '33.333333%',
        '3/6': '50%',
        '4/6': '66.666667%',
        '5/6': '83.333333%',
        '1/12': '8.333333%',
        '2/12': '16.666667%',
        '3/12': '25%',
        '4/12': '33.333333%',
        '5/12': '41.666667%',
        '6/12': '50%',
        '7/12': '58.333333%',
        '8/12': '66.666667%',
        '9/12': '75%',
        '10/12': '83.333333%',
        '11/12': '91.666667%',
        '21/100': '21%',
        '77/200': '38.5%',
        '45/100': '45%',
        '55/100': '55%',
      },
      inset: {
        '1/2': '50%',
      },
      minWidth: {
        '28': '7rem',
        '32': '8rem',
      },
      minHeight: {
        '14': '3.5rem',
      },
      maxWidth: {
        '16': '4rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem',
      },
      maxHeight: {
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
      },
      fontSize: {
        '2xl-extra': '1.625rem',
      },
      zIndex: {
        '41': '41',
        '51': '51',
      },
    }
  },
  variants: {
    backgroundColor: ['responsive', 'hover', 'focus', 'active']
  },
  plugins: [],
  purge: false,
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
