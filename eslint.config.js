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
])

export default eslintConfig
