module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "unused-imports", "react-refresh"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  ignorePatterns: ["dist/**", ".netlify/**", ".bolt/**"],
  rules: {
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": ["warn", {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_"
    }],
    "@typescript-eslint/no-explicit-any": "off",
    "react-refresh/only-export-components": "warn"
  },
  settings: { react: { version: "detect" } }
};
