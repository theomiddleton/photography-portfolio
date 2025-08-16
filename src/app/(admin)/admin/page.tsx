import { AdminTitle } from '~/components/admin/titles'
import { adminSections } from '~/config/admin-sections'
import { isStoreEnabledServer } from '~/lib/store-utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Administrative dashboard for managing the portfolio'
}

export default function Admin() {
  const storeEnabled = isStoreEnabledServer()
  
  // Filter out store sections if store is disabled
  const filteredSections = adminSections.filter((section) => {
    if (!storeEnabled) {
      return !section.href.includes('/store')
    }
    return true
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* map over each section and display the title, description, and icon */}
        {filteredSections.map((section) => (
          <AdminTitle
            key={section.title}
            title={section.title}
            description={section.description}
            icon={section.icon}
            href={section.href}
          />
        ))}
      </div>
    </div>
  )
}