module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended',
      'prettier',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: "module",
        project: "./tsconfig.json"
    },
    plugins: [
        'react-refresh',
        '@typescript-eslint',
        'prettier'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 1,
      '@typescript-eslint/no-non-null-assertion': 1,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'prettier/prettier': [
        "error",
        {
            printWidth: 140,
            tabWidth: 2,
            useTabs: false,
            semi: true,
            singleQuote: true,
            trailingComma: "all",
            bracketSpacing: true,
            arrowParens: "always"
        }
      ]
    },
  }
