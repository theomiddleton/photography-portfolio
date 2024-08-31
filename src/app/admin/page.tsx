import { ImageIcon, PenIcon, StoreIcon, InfoIcon, HomeIcon, LogOutIcon } from 'lucide-react'
import { AdminTitle } from '~/components/admin/titles'

export default function Admin() {
  const adminSections = [
    { title: 'Image Upload', description: 'Manage and upload images', icon: ImageIcon, href: '/admin/upload' },
    { title: 'Blog Post', description: 'Create and edit blog posts', icon: PenIcon, href: '/admin/blog' },
    { title: 'About', description: 'Edit about page content', icon: InfoIcon, href: '/admin/about' },
    { title: 'Store', description: 'Manage store items and inventory', icon: StoreIcon, href: '/admin/store' },
    { title: 'Return to Home', description: 'Return to home page', icon: HomeIcon, href: '/' },
    { title: 'Logout', description: 'Sign out of admin panel', icon: LogOutIcon, href: '/api/auth/logout' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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