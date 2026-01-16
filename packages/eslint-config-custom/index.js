module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
    },
  ],
  extends: [
    'next',
    'turbo',
    'eslint:recommended',
    'next/core-web-vitals',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
  ],
  parser: '@typescript-eslint/parser',
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {
        project: ['apps/**/tsconfig.json'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['prettier', 'json-format', '@typescript-eslint', 'import'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'warn',
    'prettier/prettier': ['warn'],
    'arrow-body-style': 1,
    'react/display-name': 0,
    'react/prop-types': 0,
    'react/no-children-prop': 0,
    'react/self-closing-comp': 2,
    'react/react-in-jsx-scope': 0,
    'react/no-unescaped-entities': 0,
    'react/jsx-filename-extension': [
      2,
      {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    ],
    'react/jsx-curly-brace-presence': ['error', 'never'],
    'react/jsx-boolean-value': ['error', 'never'],
    '@next/next/no-img-element': 0,
    'jsx-a11y/alt-text': [
      'warn',
      {
        elements: ['img'],
        img: ['Image'],
      },
    ],
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'import/no-unresolved': 2,
    'import/no-useless-path-segments': 1,
    'import/no-anonymous-default-export': 1,
    'no-console': 'error',
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        ignoreRestSiblings: false,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '(^_)|(React)',
      },
    ],
  },
};
