import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface AdminTitleProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
}

export function AdminTitle({ title, description, icon: Icon, href }: AdminTitleProps) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <Link href={href} className="block h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Link>
    </Card>
  )
}