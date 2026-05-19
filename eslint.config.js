module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        // Node.js
        process: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        // Jest
        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
    rules: {
    'no-console': ['warn', {
    allow: ['warn', 'error', 'info', 'log'],
    }],
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
      }],
      'no-multi-spaces': 'error',
      'no-trailing-spaces': 'error',
    },
  },
];
