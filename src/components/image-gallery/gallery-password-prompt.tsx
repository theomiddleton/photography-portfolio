'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LockIcon } from 'lucide-react'

const passwordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

interface GalleryPasswordPromptProps {
  gallerySlug: string
  galleryTitle: string
  onSuccess?: () => void
}

export function GalleryPasswordPrompt({ gallerySlug, galleryTitle, onSuccess }: GalleryPasswordPromptProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof passwordSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/gallery/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gallerySlug,
          password: values.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify password')
      }

      toast.success('Access granted')
      
      if (onSuccess) {
        onSuccess()
      } else {
        // Refresh the page to show the gallery
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid password')
      form.setError('password', { 
        type: 'manual', 
        message: 'Invalid password' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <LockIcon className="h-6 w-6" />
          </div>
          <CardTitle>Protected Gallery</CardTitle>
          <CardDescription>
            Enter the password to access &quot;{galleryTitle}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter gallery password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Access Gallery'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
