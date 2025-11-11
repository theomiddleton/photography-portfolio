import type { Metadata } from 'next'
import { HlsPlayerDebugger } from '~/components/video/hls-player-debugger'

export const metadata: Metadata = {
  title: 'HLS Player Debugger',
  description:
    'Interactive test bench for verifying HLS video playback across browsers including Safari/WebKit.',
}

export default function HlsTestPage() {
  return (
    <div className="container space-y-6 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">HLS Player Debugger</h1>
        <p className="text-muted-foreground">
          Use the controls below to load known good HLS streams, toggle autoplay
          and debug logging, and inspect detailed playback events for Safari
          troubleshooting.
        </p>
      </div>
      <HlsPlayerDebugger />
    </div>
  )
}
