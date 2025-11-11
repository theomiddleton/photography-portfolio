'use client'

import { useMemo, useState } from 'react'
import { HLSPlayer } from '~/components/video/hls-player'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'

const SAMPLE_SOURCES = [
  {
    label: 'Mux Test Stream',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
  {
    label: 'Akamai Big Buck Bunny',
    url: 'https://akamaized.net/teststreams/bbb/bbb.m3u8',
  },
  {
    label: 'Apple Advanced Stream',
    url: 'https://devstreaming-cdn.apple.com/videos/wwdc/2019/244s367f2jbupk3/244/hls_vod_mvp.m3u8',
  },
] as const

export function HlsPlayerDebugger() {
  const [currentUrl, setCurrentUrl] = useState<string>(SAMPLE_SOURCES[0].url)
  const [customUrl, setCustomUrl] = useState<string>(SAMPLE_SOURCES[0].url)
  const [autoPlay, setAutoPlay] = useState(false)
  const [debug, setDebug] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  const [instanceKey, setInstanceKey] = useState(0)

  const appendLog = (message: string, data?: unknown) => {
    const payload = data ? ` ${JSON.stringify(data)}` : ''
    setLogs((prev) => [
      ...prev,
      `${new Date().toISOString()} ${message}${payload}`,
    ])
  }

  const handleSelectSource = (url: string, label: string) => {
    setCurrentUrl(url)
    setCustomUrl(url)
    setInstanceKey((prev) => prev + 1)
    appendLog('Switched source', { label, url })
  }

  const handleApplyCustomSource = () => {
    if (!customUrl) return
    setCurrentUrl(customUrl)
    setInstanceKey((prev) => prev + 1)
    appendLog('Applied custom source', { url: customUrl })
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  const formattedSources = useMemo(() => SAMPLE_SOURCES, [])

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Known Working Streams</Label>
            <div className="space-y-2">
              {formattedSources.map((source) => (
                <Button
                  key={source.url}
                  variant={source.url === currentUrl ? 'secondary' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleSelectSource(source.url, source.label)}
                >
                  {source.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-url">Custom HLS URL</Label>
            <Input
              id="custom-url"
              value={customUrl}
              onChange={(event) => setCustomUrl(event.target.value)}
              placeholder="https://example.com/stream.m3u8"
            />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleApplyCustomSource}>
                Load Custom Stream
              </Button>
              <Button variant="outline" onClick={handleClearLogs}>
                Clear Logs
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoplay-toggle">Autoplay</Label>
            <Switch
              id="autoplay-toggle"
              checked={autoPlay}
              onCheckedChange={(value) => {
                setAutoPlay(value)
                appendLog('Toggled autoplay', { value })
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="debug-toggle">Verbose Debug Logs</Label>
            <Switch
              id="debug-toggle"
              checked={debug}
              onCheckedChange={(value) => {
                setDebug(value)
                appendLog('Toggled debug logging', { value })
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>HLS Player Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-border rounded-lg border bg-black">
              <HLSPlayer
                key={instanceKey}
                src={currentUrl}
                autoPlay={autoPlay}
                debug={debug}
                onPlay={() => appendLog('Video play event fired')}
                onError={(error) =>
                  appendLog('Video error callback', { error: error.message })
                }
                onTimeUpdate={(currentTime) =>
                  appendLog('Time update', { currentTime })
                }
              />
            </div>
            <div className="text-muted-foreground text-sm">
              <p>
                <span className="font-medium">Current URL:</span> {currentUrl}
              </p>
              <p className="text-muted-foreground/80 text-xs">
                Known working streams are included for baseline behaviour
                testing across browsers including Safari/WebKit.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-border h-64 overflow-auto rounded-md border bg-zinc-950 p-3 font-mono text-xs text-lime-200">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">
                  Interact with the player to capture debug logs.
                </p>
              ) : (
                <ul className="space-y-1">
                  {logs.map((entry, index) => (
                    <li key={`${entry}-${index}`}>{entry}</li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
