// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const stylistic = require('@stylistic/eslint-plugin');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      'import/no-named-as-default-member': 0,
      '@stylistic/semi': [1, 'always'],
      '@stylistic/no-extra-semi': [1],
      '@stylistic/quotes': [
        1, 'single', { 'avoidEscape': true, 'allowTemplateLiterals': 'always' }
      ],
      '@stylistic/jsx-quotes': [1, 'prefer-double'],
    },
  },
]);
