module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['vue'],
  rules: {
    // Console и debug
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    // Vue правила
    'vue/multi-word-component-names': 'off',
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/no-unused-vars': 'error',
    'vue/no-mutating-props': 'error',
    'vue/no-v-html': 'warn',
    'vue/require-v-for-key': 'error',
    'vue/no-use-v-if-with-v-for': 'error',
    'vue/html-self-closing': ['error', {
      'html': {
        'void': 'never',
        'normal': 'always',
        'component': 'always'
      },
      'svg': 'always',
      'math': 'always'
    }],

    // JavaScript правила
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-duplicate-imports': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'prefer-arrow-callback': 'error',
    'no-useless-return': 'error',
    'no-useless-catch': 'error',
    'no-empty': 'error',
    'eqeqeq': ['error', 'always'],

    // Безопасность
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // Лучшие практики (смягчены для постепенного улучшения)
    'consistent-return': 'warn',
    'default-case': 'warn',
    'no-fallthrough': 'error',
    'no-global-assign': 'error',
    'no-implicit-globals': 'error',
    'curly': ['warn', 'all']
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser'
    }
  ]
}