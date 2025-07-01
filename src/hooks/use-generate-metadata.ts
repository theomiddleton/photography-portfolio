'use client'

import { useState } from 'react'

export interface Metadata {
  title: string
  description: string
  tags: string
}

export function useGenerateMetadata() {
  const [loading, setLoading] = useState(false)
  const [controller, setController] = useState<AbortController | null>(null)

  async function generate(
    imageUrl: string,
    tasks: string[],
  ): Promise<Partial<Metadata>> {
    // Abort previous request if still running
    if (controller) {
      controller.abort()
    }

    const newController = new AbortController()
    setController(newController)
    setLoading(true)

    try {
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, tasks }),
        signal: newController.signal,
      })

      if (!response.ok) {
        throw new Error(`Failed to generate metadata: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let json = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        json += decoder.decode(value, { stream: true })
      }

      setLoading(false)
      setController(null)
      return JSON.parse(json)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted, don't throw error
        return {}
      }
      setLoading(false)
      setController(null)
      throw error
    }
  }

  return { generate, loading }
}
