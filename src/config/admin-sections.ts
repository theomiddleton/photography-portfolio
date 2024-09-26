import { ImageIcon, PenIcon, InfoIcon, StoreIcon, UserIcon, HomeIcon, LogOutIcon, BookOpenText } from 'lucide-react'

export const adminSections = [
  { title: 'Image Upload', description: 'Manage and upload images', icon: ImageIcon, href: '/admin/upload' },
  { title: 'Blogs', description: 'View and edit blog posts', icon: BookOpenText, href: '/admin/blog' },
  { title: 'New Blog Post', description: 'Create a new blog posts', icon: PenIcon, href: '/admin/blog/newpost' },
  { title: 'About', description: 'Edit about page content', icon: InfoIcon, href: '/admin/about' },
  { title: 'Store', description: 'Manage store items and inventory', icon: StoreIcon, href: '/admin/store' },
  { title: 'Users', description: 'Manage user accounts and permissions', icon: UserIcon, href: '/admin/users'},
  { title: 'Return to Home', description: 'Return to home page', icon: HomeIcon, href: '/' },
  { title: 'Logout', description: 'Sign out of admin panel', icon: LogOutIcon, href: '/logout' },
]