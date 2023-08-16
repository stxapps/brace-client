const colors = require('tailwindcss/colors');

module.exports = {
  purge: false,
  theme: {
    extend: {
      colors: {
        green: colors.green,
        'gray-logo': '#1A202C',
        'purple-blockstack': '#211F6D',
      },
      minWidth: {
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
      },
      minHeight: {
        '14': '3.5rem',
        'xl': '36rem',
      },
      maxWidth: {
        '16': '4rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem',
      },
      fontSize: {
        '2xl-extra': ['1.625rem', { lineHeight: '2.17rem' }],
      },
      zIndex: {
        '41': '41',
        '51': '51',
      },
      lineHeight: {
        '5.5': '1.375rem',
        '6.5': '1.625rem',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
