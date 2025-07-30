import { ThemeCustomizer } from '~/components/admin/theme/theme-customizer'

export default function ThemeTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Live Theme System Demo</h1>
        <p className="text-muted-foreground">
          Test the real-time theme customization system. Changes apply instantly without page refresh.
        </p>
      </div>
      
      <div className="flex justify-center">
        <ThemeCustomizer />
      </div>
    </div>
  )
}