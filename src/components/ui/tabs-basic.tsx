import React from 'react'
import * as Tabs from '@radix-ui/react-tabs'

export function TabsDemo() {
  return (
    <Tabs.Root className="TabsRoot" defaultValue="tab1" orientation="vertical">
      <Tabs.List className="TabsList" aria-label="Manage your account">
        <Tabs.Trigger className="TabsTrigger" value="tab1">
          Image
        </Tabs.Trigger>
        <Tabs.Trigger className="TabsTrigger" value="tab2">
          Blog
        </Tabs.Trigger>
        <Tabs.Trigger className="TabsTrigger" value="tab3">
          Ecommerce
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content className="TabsContent" value="tab1">
        {/* Account */}
      </Tabs.Content>
      <Tabs.Content className="TabsContent" value="tab2"> 
        {/* Password */}
      </Tabs.Content>
    </Tabs.Root>
  )
}