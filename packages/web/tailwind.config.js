const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  purge: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        green: colors.green,
        'gray-logo': '#1A202C',
        'purple-blockstack': '#211F6D',
      },
      minWidth: {
        '28': '7rem',
        '32': '8rem',
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
      spacing: {
        '45/100': '45%',
        '55/100': '55%',
      },
      listStyleType: {
        alpha: 'lower-alpha',
      },
    },
  },
  variants: {
    extend: {
      textColor: ['group-focus', 'focus-visible'],
      ringColor: ['group-focus', 'focus-visible'],
      ringOffsetColor: ['group-focus', 'focus-visible'],
      ringOffsetWidth: ['group-focus', 'focus-visible'],
      ringOpacity: ['group-focus', 'focus-visible'],
      ringWidth: ['group-hover', 'group-focus', 'hover', 'focus-visible'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
};
