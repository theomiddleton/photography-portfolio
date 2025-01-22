import { ImageIcon, PenIcon, InfoIcon, StoreIcon, UserIcon, HomeIcon, LogOutIcon, BookOpenText, ImagesIcon, FilmIcon, FileVideoIcon, BookOpenIcon, BookOpenTextIcon, ProportionsIcon } from 'lucide-react'

export const adminSections = [
  { title: 'Image Upload', description: 'Manage and upload images', icon: ImageIcon, href: '/admin/upload' },
  { title: 'Image Management', description: 'Delete, hide, and reorder images', icon: ImagesIcon, href: '/admin/manage'},
  { title: 'Blogs', description: 'View and edit blog posts', icon: BookOpenText, href: '/admin/blog' },
  { title: 'New Blog Post', description: 'Create a new blog posts', icon: PenIcon, href: '/admin/blog/newpost' },
  { title: 'About', description: 'Edit about page content', icon: InfoIcon, href: '/admin/about' },
  { title: 'Store', description: 'Manage store items and inventory', icon: StoreIcon, href: '/admin/store' },
  { title: 'Sizes', description: 'Manage print sizes and prices', icon: ProportionsIcon, href: '/admin/store/sizes' },
  { title: 'Users', description: 'Manage user accounts and permissions', icon: UserIcon, href: '/admin/users'},
  { title: 'Videos', description: 'Manage HLS videos', icon: FilmIcon, href: '/admin/videos'  },
  { title: 'Video Upload', description: 'Upload a new Video', icon: FileVideoIcon, href: '/admin/videos/new'  }, 
  { title: 'Custom Pages', description: 'View and manage custom pages', icon: BookOpenTextIcon, href: '/admin/pages' },
  { title: 'New Custom Page', description: 'Create a new custom page', icon: BookOpenIcon, href: '/admin/pages/new' },
  { title: 'Return to Home', description: 'Return to home page', icon: HomeIcon, href: '/' },
  { title: 'Logout', description: 'Sign out of admin panel', icon: LogOutIcon, href: '/logout' },
]