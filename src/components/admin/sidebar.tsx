import Link from 'next/link'
import { adminSections } from '~/config/admin-sections'

export function AdminSidebar() {
  return (  
    <div className="flex flex-col gap-4 border-r bg-muted/40 p-4 h-full">
      <nav className="grid gap-2">
        {adminSections.map((section, index) => {
          const Icon = section.icon
          return (
            <Link
              key={index}
              href={section.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
              prefetch={false}
            >
              <Icon className="h-4 w-4" />
              {section.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}