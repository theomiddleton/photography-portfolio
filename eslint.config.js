import stylistic from '@stylistic/eslint-plugin'
import prettier from 'eslint-config-prettier'
import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    plugins: { '@stylistic': stylistic },
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@stylistic/quotes': [
        'warn',
        'single',
        { avoidEscape: true, allowTemplateLiterals: 'avoidEscape' },
      ],
      '@stylistic/jsx-quotes': ['warn', 'prefer-single'],
    },
  },
  // --- Prettier compatibility (turns off conflicting stylistic rules) ---
  prettier,
]

export default eslintConfig
