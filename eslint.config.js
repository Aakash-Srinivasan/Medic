// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // False-positives on react-native-reanimated's `.value =` mutation
      // pattern (a shared value's setter, not a React-considered-immutable
      // value). See https://docs.expo.dev/guides/using-eslint/
      'react-hooks/immutability': 'off',
    },
  },
]);
