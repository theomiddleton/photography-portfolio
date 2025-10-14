import type { Metadata } from 'next'

import { getServerSiteConfig } from '~/config/site'
import { flattenConfig } from '~/lib/config-inspector'
import { Badge } from '~/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

import { ConfigHydrationPanel } from './config-hydration-panel'

export const metadata: Metadata = {
  title: 'Site Configuration Inspector',
  description:
    'Visualise server and client site configuration states at a glance',
}

const formatLabel = (path: string) =>
  path
    .split('.')
    .map((segment) =>
      segment.replace(/\[(\d+)\]/g, (_, index) => ` [${index}]`),
    )
    .join(' › ')

const highlightRows = (config: ReturnType<typeof getServerSiteConfig>) => [
  { label: 'Site title', value: config.title },
  { label: 'Primary URL', value: config.url },
  { label: 'Owner', value: config.ownerName },
  { label: 'Config source', value: config.configLocation },
  {
    label: 'AI features',
    value: config.features.aiEnabled ? 'Enabled' : 'Disabled',
  },
  {
    label: 'Store features',
    value: config.features.storeEnabled ? 'Enabled' : 'Disabled',
  },
]

export default async function SiteConfigInspectorPage() {
  const serverConfig = getServerSiteConfig()
  const flattenedServerConfig = flattenConfig(serverConfig)

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Badge variant="secondary" className="tracking-wide uppercase">
          Diagnostics
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          Site configuration inspector
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Validate that your runtime configuration is flowing correctly to both
          server-rendered components and hydrated client experiences. This
          utility mirrors the production data flow while providing a
          developer-friendly overview.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="h-full">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  Server-rendered snapshot
                </CardTitle>
                <CardDescription>
                  Generated via <code>getServerSiteConfig()</code> during the
                  request lifecycle
                </CardDescription>
              </div>
              <Badge variant="outline">Server component</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              {highlightRows(serverConfig).map((stat) => (
                <div
                  key={stat.label}
                  className="bg-muted/30 rounded-lg border p-4"
                >
                  <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                    {stat.label}
                  </dt>
                  <dd className="text-foreground mt-2 text-base font-medium break-all">
                    {stat.value || '—'}
                  </dd>
                </div>
              ))}
            </dl>

            <Separator />

            <Tabs defaultValue="structured" className="w-full">
              <TabsList>
                <TabsTrigger value="structured">Structured view</TabsTrigger>
                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="structured" className="mt-4">
                <ScrollArea className="h-[420px] rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2">Property path</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="w-24 text-right">Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flattenedServerConfig.map((entry) => (
                        <TableRow key={entry.path}>
                          <TableCell className="font-medium">
                            {formatLabel(entry.path)}
                          </TableCell>
                          <TableCell className="text-muted-foreground break-all">
                            {entry.value}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className="font-mono text-[11px] uppercase"
                            >
                              {entry.valueType}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="raw" className="mt-4">
                <ScrollArea className="bg-muted/40 h-[420px] rounded-lg border p-4">
                  <pre className="text-muted-foreground text-sm leading-relaxed">
                    {JSON.stringify(serverConfig, null, 2)}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <ConfigHydrationPanel serverConfig={serverConfig} />
      </div>
    </div>
  )
}
