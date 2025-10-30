import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import stylistic from '@stylistic/eslint-plugin'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  // JavaScript/TypeScript files - single quotes
  {
    plugins: { '@stylistic': stylistic },
    files: ['**/*.{js,ts}'],
    rules: {
      '@stylistic/quotes': [
        'warn',
        'single',
        { avoidEscape: true, allowTemplateLiterals: 'avoidEscape' },
      ],
    },
  },
  // JSX/TSX files - single quotes for JS, double quotes for JSX attributes
  {
    plugins: { '@stylistic': stylistic },
    files: ['**/*.{jsx,tsx}'],
    rules: {
      '@stylistic/quotes': [
        'warn',
        'single',
        { avoidEscape: true, allowTemplateLiterals: 'avoidEscape' },
      ],
      '@stylistic/jsx-quotes': ['warn', 'prefer-double'],
    },
  },
])

export default eslintConfig