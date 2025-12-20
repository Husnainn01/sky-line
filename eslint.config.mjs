import { defineConfig } from "eslint-define-config";

const eslintConfig = defineConfig({
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
