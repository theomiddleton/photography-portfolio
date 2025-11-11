'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { Code, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      case "'":
        return '&#39;'
      default:
        return char
    }
  })

interface VideoEmbedDialogProps {
  slug: string
  title: string
}

export function VideoEmbedDialog({ slug, title }: VideoEmbedDialogProps) {
  const [autoplay, setAutoplay] = useState(false)
  const [width, setWidth] = useState(640)
  const [height, setHeight] = useState(360)
  const [copied, setCopied] = useState(false)

  const generateEmbedCode = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const params = new URLSearchParams()
    if (autoplay) params.append('autoplay', '1')
    const queryString = params.toString() ? `?${params.toString()}` : ''
    const escapedTitle = escapeHtml(title)

    return `<iframe
  width="${width}"
  height="${height}"
  src="${origin}/video/${slug}${queryString}"
  title="${escapedTitle}"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>`
  }

  const embedCode = generateEmbedCode()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      toast.success('Embed code copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (_error) {
      toast.error('Failed to copy embed code')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Code className="mr-2 h-4 w-4" />
          Embed
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Embed Video</DialogTitle>
          <DialogDescription>
            Copy the code below to embed this video on your website
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (px)</Label>
              <input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 640)}
                className="w-full rounded-md border px-3 py-2"
                min="320"
                max="1920"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (px)</Label>
              <input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 360)}
                className="w-full rounded-md border px-3 py-2"
                min="180"
                max="1080"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Autoplay</Label>
              <p className="text-muted-foreground text-sm">
                Start playing automatically when loaded
              </p>
            </div>
            <Switch checked={autoplay} onCheckedChange={setAutoplay} />
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <Label>Embed Code</Label>
            <div className="relative">
              <Textarea
                value={embedCode}
                readOnly
                className="h-40 resize-none font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="bg-muted/50 rounded-lg border p-4">
              <div
                style={{
                  width: `${Math.min(width, 560)}px`,
                  height: `${Math.min(height, 315)}px`,
                }}
                className="text-muted-foreground mx-auto flex items-center justify-center rounded bg-black/10 text-sm"
              >
                {width} × {height}px
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
