module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },
  // Need this in order to use "immer" https://stackoverflow.com/a/35641689/9787887
  rules: {
    'no-param-reassign': [
      2,
      {
        props: false,
      },
    ],
  },
};
