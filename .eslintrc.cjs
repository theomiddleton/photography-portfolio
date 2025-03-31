/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended", // Changed from recommended-type-checked
    // Removed stylistic-type-checked
  ],
  rules: {
    // rules related to strict typing
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",
    
    "@typescript-eslint/array-type": "warn",
    "@typescript-eslint/consistent-type-definitions": "warn",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: { attributes: false },
      },
    ],
    "no-html-link-for-pages": "off",
  },
  overrides: [
    {
      files: ["src/**/*.{ts,tsx,js,jsx}"],
      rules: {
        "quotes": ["warn", "single", { "avoidEscape": true }],
      },
    },
  ],
}

module.exports = config