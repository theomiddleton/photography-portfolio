import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSession } from '~/lib/auth/auth'
import { seedBuiltInThemes } from '~/lib/themes/seed-themes'
import { ThemeSettingsClient } from '~/components/admin/theme/theme-settings-client'

export const metadata: Metadata = {
  title: 'Theme Settings - Admin Dashboard',
  description:
    'Advanced theme management system with custom CSS support and database storage',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function ThemeSettingsPage() {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    notFound()
  }

  // Seed built-in themes if they don't exist
  try {
    await seedBuiltInThemes()
  } catch (error) {
    console.error('Error seeding themes:', error)
  }

  return <ThemeSettingsClient />
}
