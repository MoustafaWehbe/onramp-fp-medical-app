import reactHooks from 'eslint-plugin-react-hooks';
import importX from 'eslint-plugin-import-x';
import globals from 'globals';
import sharedBase from './packages/shared/config/eslint.config.mjs';

const { browser, es2020, es2022, node } = globals;

const TSCONFIG_PROJECTS = [
  'packages/api/tsconfig.json',
  'packages/shared/tsconfig.json',
  'packages/workers/tsconfig.json',
  'packages/web/tsconfig.json',
];

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      'packages/api/tests/**',
      'packages/api/src/migrations/**',
      'packages/api/src/seeders/**',
      'packages/shared/**/*.{js,cjs,mjs,d.ts}',
    ],
  },
  ...sharedBase,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'import-x': importX,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: TSCONFIG_PROJECTS,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
      'import-x/no-unresolved': ['error', { ignore: ['\\.(css)$'] }],
      'import-x/no-duplicates': 'error',
    },
  },
  {
    files: [
      'packages/api/**/*.{ts,js,cjs,mjs}',
      'packages/shared/**/*.ts',
      'packages/workers/**/*.ts',
      'packages/web/vite.config.ts',
      '**/*.config.js',
    ],
    languageOptions: {
      globals: { ...node, ...es2022, NodeJS: 'readonly' },
    },
  },
  {
    files: ['packages/web/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...browser, ...es2020, React: 'readonly' },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: '18.3' },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];