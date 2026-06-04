import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    "node_modules/**",
    "**/node_modules/**",
    ".next/**",
    ".next-old*/**",
    ".npm-cache/**",
    ".open-next/**",
    ".open-next-old*/**",
    ".wrangler/**",
    ".xdg-cache/**",
    ".agents/**",
    ".claude/**",
    ".gemini/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scratch/**",
    "*.txt",
    "*.log",
    "*.sh",
    "*.js",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "jsx-a11y/alt-text": "off",
    }
  }
]);

export default eslintConfig;
