module.exports = {
  "extends": ["origami-component", "plugin:prettier/recommended"],
  "env": {
    "browser": true,
    "mocha": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 2018
  },
  "globals": {
    "expect": true,
    "testGlobals": true
  },
  "rules": {
    "guard-for-in": 0,
    // Temporary additions to appease linter
    "@lwc/lwc/no-async-await": 0,
    "class-methods-use-this": 0,
    "no-await-in-loop": 0,
    "no-constant-condition": 0,
    "no-self-assign": 0,
    "no-throw-literal": 0,
    "no-unused-expressions": 0,
    "prefer-promise-reject-errors": 0,
    "require-await": 0,
  }
}

