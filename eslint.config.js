const js = require('@eslint/js');
const globals = require('globals');
const prettierPlugin = require('eslint-plugin-prettier');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  // استخدم الـ recommended مباشرة
  js.configs.recommended,

  // استخدم إعدادات Prettier مباشرة
  eslintConfigPrettier,

  // إعدادات المشروع
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },

    plugins: {
      prettier: prettierPlugin,
    },

    rules: {
      'prettier/prettier': ['error'],
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];
