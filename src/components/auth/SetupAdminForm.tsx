'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { setupFirstAdmin } from '~/lib/auth/setupAdmin'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Loader2, Shield, User, Mail, Lock } from 'lucide-react'
import { generateCSRFToken } from '~/lib/csrf-protection'

export function SetupAdminForm() {
  const router = useRouter()
  const [state, action, isPending] = useActionState(setupFirstAdmin, {
    message: '',
  })
  const [csrfToken, setCsrfToken] = useState('')

  // Generate CSRF token on component mount
  useEffect(() => {
    async function fetchCsrfToken() {
      const token = await generateCSRFToken()
      setCsrfToken(token)
    }
    fetchCsrfToken()
  }, [])

  // Handle successful admin creation
  useEffect(() => {
    if (state.success && state.redirect) {
      router.push(state.redirect)
    }
  }, [state.success, state.redirect, router])

  return (
    <div className="grid gap-6">
      <form action={action} className="grid gap-4">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              type="text"
              autoCapitalize="words"
              autoComplete="name"
              autoCorrect="off"
              className="pl-9"
              disabled={isPending}
              defaultValue={state.fields?.name || ''}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              placeholder="admin@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className="pl-9"
              disabled={isPending}
              defaultValue={state.fields?.email || ''}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="pl-9"
              disabled={isPending}
              placeholder="Choose a strong password"
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="pl-9"
              disabled={isPending}
              placeholder="Confirm your password"
              required
            />
          </div>
        </div>

        {state.message && (
          <Alert variant={state.success ? "default" : "destructive"}>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {state.issues && state.issues.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {state.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Shield className="mr-2 h-4 w-4" />
          Create Admin Account
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <p className="mb-2">Password Requirements:</p>
        <ul className="text-xs space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Use a combination of letters, numbers, and symbols</li>
          <li>• This will be the only admin creation page</li>
        </ul>
      </div>
    </div>
  )
}