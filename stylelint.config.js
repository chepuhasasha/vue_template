export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-concentric-order',
    'stylelint-config-html',
    'stylelint-config-prettier-scss',
  ],
  plugins: ['stylelint-order'],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss',
    },
  ],
  rules: {
    'selector-class-pattern': null,
    'no-descending-specificity': null,
  },
}
