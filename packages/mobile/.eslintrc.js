module.exports = {
  root: true,
  extends: '@react-native-community',
  ignorePatterns: ['**/ios/**/*.js'],
  rules: {
    'prettier/prettier': 0,
    'dot-notation': 0,
    'react-native/no-inline-styles': 0,
    curly: ['error', 'multi-line'],
  },
};
