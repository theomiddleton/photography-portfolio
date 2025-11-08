import { ImageIcon, PenIcon, InfoIcon, StoreIcon, UserIcon, HomeIcon, LogOutIcon, BookOpenText, ImagesIcon, BookOpenIcon, BookOpenTextIcon, ReceiptPoundSterlingIcon, DownloadIcon, GalleryThumbnailsIcon, FolderOpenIcon, SettingsIcon, Database, VideoIcon } from 'lucide-react'

export const adminSections = [
  { title: 'Image Upload', description: 'Manage and upload images', icon: ImageIcon, href: '/admin/upload' },
  { title: 'Image Management', description: 'Delete, hide, and reorder images', icon: ImagesIcon, href: '/admin/manage'},
  { title: 'Image Migration', description: 'Export and import image data', icon: DownloadIcon, href: '/admin/migrate'},
  { title: 'Gallery Management', description: 'Manage the layout of the gallery', icon: GalleryThumbnailsIcon, href: '/admin/gallery'},
  { title: 'Custom Galleries', description: 'Create and manage custom galleries', icon: GalleryThumbnailsIcon, href: '/admin/galleries'},
  { title: 'Videos', description: 'Manage HLS videos with visibility controls', icon: VideoIcon, href: '/admin/videos' },
  { title: 'New Video', description: 'Upload a new HLS video', icon: VideoIcon, href: '/admin/videos/new' },
  { title: 'Blogs', description: 'View and edit blog posts', icon: BookOpenText, href: '/admin/blog' },
  { title: 'New Blog Post', description: 'Create a new blog posts', icon: PenIcon, href: '/admin/blog/new' },
  { title: 'About', description: 'Edit about page content', icon: InfoIcon, href: '/admin/about' },
  { title: 'Store', description: 'Manage orders and store items', icon: StoreIcon, href: '/admin/store' },
  { title: 'Costs', description: 'Manage shipping, tax rates, and print sizes', icon: ReceiptPoundSterlingIcon, href: '/admin/store/costs' },
  { title: 'Users', description: 'Manage user accounts and permissions', icon: UserIcon, href: '/admin/users'},
  { title: 'Files', description: 'Browse and manage files in R2 storage', icon: FolderOpenIcon, href: '/admin/files' },
  { title: 'Storage Alerts', description: 'Monitor R2 storage usage and configure alerts', icon: Database, href: '/admin/storage-alerts' },
  { title: 'Config Inspector', description: 'Compare server and client site configuration states', icon: SettingsIcon, href: '/admin/site-config' },
  { title: 'Custom Pages', description: 'View and manage custom pages', icon: BookOpenTextIcon, href: '/admin/pages' },
  { title: 'New Custom Page', description: 'Create a new custom page', icon: BookOpenIcon, href: '/admin/pages/new' },
  { title: 'Return to Home', description: 'Return to home page', icon: HomeIcon, href: '/' },
  { title: 'Logout', description: 'Sign out of admin panel', icon: LogOutIcon, href: '/logout' },
]