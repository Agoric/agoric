import eslintPluginEslintPlugin from 'eslint-plugin-eslint-plugin';
import eslintPluginN from 'eslint-plugin-n';

export default [
  {
    plugins: {
      'eslint-plugin': eslintPluginEslintPlugin,
      n: eslintPluginN,
    },
    extends: [
      'plugin:eslint-plugin/recommended',
      'plugin:n/recommended',
    ],
  },
];
