import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '*.vsix'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
      },
      sourceType: 'module',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    rules: {
      'no-console': 'off',
    },
  },
);
