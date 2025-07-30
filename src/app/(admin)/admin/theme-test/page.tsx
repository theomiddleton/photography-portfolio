import { ThemeCustomizer } from '~/components/admin/theme/theme-customizer'
import { ThemePresetsDemo } from '~/components/admin/theme/theme-presets-demo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

export default function ThemeTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Live Theme System Demo</h1>
        <p className="text-muted-foreground">
          Test the real-time theme customization system. Changes apply instantly without page refresh.
        </p>
      </div>
      
      <Tabs defaultValue="customizer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customizer">Theme Customizer</TabsTrigger>
          <TabsTrigger value="presets">Theme Presets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customizer" className="flex justify-center">
          <ThemeCustomizer />
        </TabsContent>
        
        <TabsContent value="presets">
          <ThemePresetsDemo />
        </TabsContent>
      </Tabs>
    </div>
  )
}