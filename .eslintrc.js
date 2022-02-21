module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "linebreak-style": ["error", "unix"],
    "max-len": ["error", { code: 120 }],
    "no-constant-condition": ["error", { checkLoops: false }],
    semi: ["error", "never"],
  },
}
