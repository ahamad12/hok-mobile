module.exports = {
  root: true,
  env: {
    browser: false,
    amd: true,
    node: true,
    es2021: true,
    'react-native/react-native': true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
  ],
  plugins: [
    'react',
    'react-native',
    '@typescript-eslint',
    'jest',
    'import',
    'simple-import-sort',
    'unicorn',
    'security',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    /* --- TypeScript --- */
    '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'no-type-imports',
        disallowTypeAnnotations: false,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',

    /* --- React / RN --- */
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-single-element-style-arrays': 'error',

    /* --- Imports --- */
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/extensions': [
      'error',
      'ignorePackages',
      { ts: 'never', tsx: 'never' },
    ],

    /* --- Code Quality --- */
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'consistent-return': 'error',
    'no-duplicate-imports': 'error',
    'unicorn/prefer-optional-catch-binding': 'error',
    'unicorn/prefer-top-level-await': 'error',
    'unicorn/prefer-string-replace-all': 'error',

    /* --- Security --- */
    'security/detect-object-injection': 'warn',
  },
  overrides: [
    // Test files
    {
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      extends: ['plugin:testing-library/react'],
    },
    // JS config/root files — skip type-aware parsing
    {
      files: [
        '*.js',
        '*.cjs',
        '*.mjs',
        'index.ts',
        'babel.config.js',
        'app.config.js',
        'commitlint.config.js',
      ],
    },
  ],
};
