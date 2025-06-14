import type { Config } from 'prettier'
import type { PluginOptions } from 'prettier-plugin-tailwindcss'

const config: Config & PluginOptions = {
  singleQuote: true,
  semi: false,
  tabWidth: 2,
  useTabs: false,
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
  