// Re-export server configuration as main siteConfig for server components
import { getServerSiteConfig, type SiteConfig } from '~/lib/server-site-config'

export const siteConfig = getServerSiteConfig()
export type { SiteConfig }
