const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
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
      spacing: {
        '45/100': '45%',
        '55/100': '55%',
      },
      listStyleType: {
        alpha: 'lower-alpha',
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    plugin(function ({ addVariant }) {
      addVariant('blk', '&');
    }),
  ],
};
