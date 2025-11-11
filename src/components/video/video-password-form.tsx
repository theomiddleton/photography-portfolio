'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'

interface VideoPasswordFormProps {
  slug: string
}

export function VideoPasswordForm({ slug }: VideoPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/videos/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug, password }),
      })

      const data = await response.json()

      if (response.ok && data.canAccess) {
        setPassword('')
        router.replace(`/video/${slug}`)
        router.refresh()
      } else {
        toast.error('Incorrect password. Please try again.')
      }
    } catch (error) {
      console.error('Error verifying password:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <CardTitle>Password Required</CardTitle>
        </div>
        <CardDescription>
          This video is private. Please enter the password to view it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !password}
          >
            {isLoading ? 'Verifying...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
