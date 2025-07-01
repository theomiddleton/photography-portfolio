import { Suspense } from 'react'
import { ThemeManagementClient } from '~/components/theme-management-client'
import { getActiveTheme, getAllThemes } from '~/lib/theme/theme-service'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Theme Management',
  description: 'Manage your site themes and appearance settings',
}

async function ThemeData() {
  const [themes, activeTheme] = await Promise.all([
    getAllThemes(),
    getActiveTheme(),
  ])

  return (
    <ThemeManagementClient
      initialThemes={themes}
      initialActiveTheme={activeTheme}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-3 h-8 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function ThemesPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <ThemeData />
      </Suspense>
    </div>
  )
}
