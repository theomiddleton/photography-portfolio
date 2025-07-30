import { notFound } from 'next/navigation'
import { getSession } from '~/lib/auth/auth'
import { ThemeToggle } from '~/components/admin/theme/theme-toggle'
import { ThemeSelector } from '~/components/admin/theme/theme-selector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

export default async function ThemeSettingsPage() {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Theme Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize the appearance of your admin interface
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Theme Mode</CardTitle>
              <CardDescription>
                Switch between light and dark mode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeToggle />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Theme</CardTitle>
              <CardDescription>
                Choose from predefined color schemes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your theme changes look across different components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                Primary Button
              </button>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Secondary Button
              </button>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2">
                Destructive Button
              </button>
            </div>
            
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold text-card-foreground">Card Component</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This is how cards will appear with your current theme settings.
              </p>
            </div>

            <div className="rounded-lg border-l-4 border-primary bg-background p-4">
              <p className="text-sm">
                <strong>Note:</strong> Theme changes apply immediately and are saved automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}