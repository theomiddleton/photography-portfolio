import { AdminTitle } from '~/components/admin/titles'

import { adminSections } from '~/config/admin-sections'

export default function Admin() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* map over each section and display the title, description, and icon */}
        {adminSections.map((section) => (
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