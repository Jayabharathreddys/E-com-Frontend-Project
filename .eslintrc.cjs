module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime', // disables react/react-in-jsx-scope for React 18
    'plugin:react-hooks/recommended',
    'prettier', // must be last — disables ESLint rules that conflict with Prettier
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    // React 18 JSX transform — no need to import React in every file
    // Also allow unused destructured vars prefixed with _ (e.g. _id)
    'no-unused-vars': ['warn', { varsIgnorePattern: '^React$', argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
    // PropTypes are optional in this project (no TypeScript, small team)
    'react/prop-types': 'off',
  },
  overrides: [
    {
      // Playwright config + e2e test files — need Node.js globals (process, require, module)
      files: ['playwright.config.js', 'playwright.config.cjs', 'e2e/**/*.js'],
      env: { node: true, es2020: true },
    },
    {
      // Vitest test files — declare all test globals so ESLint doesn't flag them
      files: ['src/test/**/*.{js,jsx}', '**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
      env: { browser: true },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        global: 'readonly',
      },
    },
  ],
}
