module.exports = {
  theme: {
    extend: {
      colors: {
        'purple-blockstack': '#211F6D'
      },
      spacing: {
        '7': '1.75rem',
        '9': '2.25rem',
        '14': '3.5rem',
        '72': '18rem',
        '96': '24rem',
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
      zIndex: {
        '41': '41',
        '51': '51',
      },
    }
  },
  variants: {

  },
  plugins: [],
  purge: false,
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
