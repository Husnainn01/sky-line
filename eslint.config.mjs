import { defineConfig } from "eslint-define-config";
import nextPlugin from '@next/eslint-plugin-next';

const eslintConfig = defineConfig({
  plugins: {
    next: nextPlugin
  },
  extends: ["next", "next/core-web-vitals"],
  ignorePatterns: [
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ],
  rules: {
    // Add any custom rules here
  }
});

export default eslintConfig;
