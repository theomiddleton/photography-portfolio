import { ImageIcon, PenIcon, StoreIcon, InfoIcon, HomeIcon, LogOutIcon, UserIcon } from 'lucide-react'
import { AdminTitle } from '~/components/admin/titles'

export default function Admin() {
  // have title and description for each route within admin, and the icon to display
  // href is the route to navigate to
  const adminSections = [
    { title: 'Image Upload', description: 'Manage and upload images', icon: ImageIcon, href: '/admin/upload' },
    { title: 'Blog Post', description: 'Create and edit blog posts', icon: PenIcon, href: '/admin/blog' },
    { title: 'About', description: 'Edit about page content', icon: InfoIcon, href: '/admin/about' },
    { title: 'Store', description: 'Manage store items and inventory', icon: StoreIcon, href: '/admin/store' },
    { title: 'Users', description: 'Manage user accounts and permissions', icon: UserIcon, href: '/admin/users'},
    { title: 'Return to Home', description: 'Return to home page', icon: HomeIcon, href: '/' },
    { title: 'Logout', description: 'Sign out of admin panel', icon: LogOutIcon, href: '/logout' },
  ]

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