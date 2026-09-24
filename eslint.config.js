import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', '*.timestamp-*'] },

  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  jsxA11y.flatConfigs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.es2022 },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      /* Import hygiene: deterministic order, no cycles, no deep relative paths. */
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'], // side-effect imports (css, polyfills)
            ['^node:'],
            ['^@?\\w'], // packages
            ['^@/'], // absolute internal
            ['^\\.\\./'], // parent relative — discouraged
            ['^\\./'], // sibling relative
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message: 'Use the `@/` absolute alias instead of climbing more than one level.',
            },
          ],
        },
      ],

      /* TypeScript */
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'error',

      /* General */
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      curly: ['error', 'multi-line'],
    },
  },

  /*
   * Config files and scripts run in Node and are not part of the app program.
   *
   * Order matters: `disableTypeChecked` carries its own `languageOptions`, so
   * it must be spread BEFORE ours — otherwise it silently overwrites the Node
   * globals and every `process` reference becomes a `no-undef` error.
   */
  {
    files: ['*.config.{js,ts}', 'eslint.config.js', 'scripts/**/*.{js,mjs}'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ...tseslint.configs.disableTypeChecked.languageOptions,
      globals: { ...globals.node, WebSocket: 'readonly', fetch: 'readonly' },
    },
  },

  prettier,
);
