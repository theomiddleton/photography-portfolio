import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { ImageIcon, PenIcon, StoreIcon, InfoIcon } from 'lucide-react'

export default function Admin() {
  const adminSections = [
    { title: 'Image Upload', description: 'Manage and upload images', icon: ImageIcon, href: '/admin/image-upload' },
    { title: 'Blog Post', description: 'Create and edit blog posts', icon: PenIcon, href: '/admin/blog-post' },
    { title: 'About', description: 'Edit about page content', icon: InfoIcon, href: '/admin/about' },
    { title: 'Store', description: 'Manage store items and inventory', icon: StoreIcon, href: '/admin/store' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {adminSections.map((section) => (
          <Card key={section.title} className="hover:bg-muted/50 transition-colors">
            <Link href={section.href} className="block h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <section.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}