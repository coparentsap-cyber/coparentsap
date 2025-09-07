import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { react, "unused-imports": unusedImports },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    rules: {
      // Supprime les imports inutiles à l'autofix
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],

      // Temporairement: on désactive les erreurs de 'any'
      "@typescript-eslint/no-explicit-any": "off",

      // Laisse en warning pour l’instant
      "react-refresh/only-export-components": "warn"
    },
    settings: { react: { version: "detect" } }
  },
  {
    // Ignore du bruit
    ignores: [
      "dist/**",
      ".netlify/**",
      ".bolt/**"
    ]
  }
];
