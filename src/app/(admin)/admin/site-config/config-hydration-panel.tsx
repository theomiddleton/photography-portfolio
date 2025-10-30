'use client'

import { useMemo } from 'react'

import { type SiteConfig } from '~/config/site'
import { useIsHydrated, useSiteConfig } from '~/hooks/use-site-config'
import {
  flattenConfig,
  createConfigSignature,
  type FlattenedConfigEntry,
} from '~/lib/config-inspector'
import { Badge } from '~/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { ScrollArea } from '~/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

const formatLabel = (path: string) =>
  path
    .split('.')
    .map((segment) =>
      segment.replace(/\[(\d+)\]/g, (_, index) => ` [${index}]`),
    )
    .join(' › ')

interface ConfigHydrationPanelProps {
  serverConfig: SiteConfig
}

const toMap = (entries: FlattenedConfigEntry[]) =>
  entries.reduce<Map<string, FlattenedConfigEntry>>((map, entry) => {
    map.set(entry.path, entry)
    return map
  }, new Map())

export function ConfigHydrationPanel({
  serverConfig,
}: ConfigHydrationPanelProps) {
  const clientConfig = useSiteConfig()
  const hydrated = useIsHydrated()

  const clientEntries = useMemo(
    () => flattenConfig(clientConfig),
    [clientConfig],
  )
  const serverEntries = useMemo(
    () => flattenConfig(serverConfig),
    [serverConfig],
  )

  const clientSignature = useMemo(
    () => createConfigSignature(clientConfig),
    [clientConfig],
  )
  const serverSignature = useMemo(
    () => createConfigSignature(serverConfig),
    [serverConfig],
  )

  const differencePaths = useMemo(() => {
    const serverMap = toMap(serverEntries)
    const clientMap = toMap(clientEntries)
    const mismatches = new Set<string>()

    serverMap.forEach((entry, path) => {
      if (!clientMap.has(path)) {
        mismatches.add(path)
        return
      }

      const clientEntry = clientMap.get(path)
      if (clientEntry?.value !== entry.value) {
        mismatches.add(path)
      }
    })

    clientMap.forEach((entry, path) => {
      if (!serverMap.has(path)) {
        mismatches.add(path)
      }
    })

    return Array.from(mismatches).sort()
  }, [serverEntries, clientEntries])

  const statusVariant =
    clientSignature === serverSignature ? 'default' : 'destructive'

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              Client runtime snapshot
            </CardTitle>
            <CardDescription>
              Resolved via <code>useSiteConfig()</code> after hydration
              completes
            </CardDescription>
          </div>
          <Badge variant="outline">Client component</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={statusVariant} className="tracking-wide uppercase">
            {clientSignature === serverSignature
              ? 'In sync with server'
              : 'Out of sync'}
          </Badge>
          <Badge variant={hydrated ? 'secondary' : 'outline'}>
            Hydrated {hydrated ? 'client' : 'pending'}
          </Badge>
          <Badge variant="outline">
            Total properties {clientEntries.length}
          </Badge>
        </div>

        {differencePaths.length > 0 ? (
          <div className="border-destructive/50 bg-destructive/5 rounded-lg border p-4">
            <p className="text-destructive text-sm font-semibold">
              Mismatched properties detected
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              The following keys differ between server and client snapshots:
            </p>
            <ul className="text-destructive mt-3 space-y-1 font-mono text-sm">
              {differencePaths.map((path) => (
                <li key={path}>• {path}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="text-sm font-semibold text-emerald-600">
              Client configuration matches the server snapshot
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              No mismatches detected across {clientEntries.length} resolved
              properties.
            </p>
          </div>
        )}

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
                  {clientEntries.map((entry) => (
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
                {JSON.stringify(clientConfig, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
