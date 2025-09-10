import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import stylistic from '@stylistic/eslint-plugin';
import tailwind from 'eslint-plugin-tailwindcss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'public/sw.js',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        callees: ['clsx', 'tailwind'],
        config: `${__dirname}/src/app/globals.css`,
      },
    },
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      'import/no-named-as-default-member': 0,
      'prefer-const': 0,
      'prefer-rest-params': 0,
      '@typescript-eslint/no-this-alias': 0,
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      '@stylistic/semi': [1, 'always'],
      '@stylistic/no-extra-semi': [1],
      '@stylistic/quotes': [
        1, 'single', { 'avoidEscape': true, 'allowTemplateLiterals': 'always' }
      ],
      '@stylistic/jsx-quotes': [1, 'prefer-double'],
      'tailwindcss/classnames-order': 0,
    },
  },
];

export default eslintConfig;
