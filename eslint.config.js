import js from '@eslint/js';
import globals from 'globals';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // استخدم الـ recommended مباشرة
  js.configs.recommended,

  // استخدم إعدادات Prettier مباشرة
  eslintConfigPrettier,

  // إعدادات المشروع
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
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
