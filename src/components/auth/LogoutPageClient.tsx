'use client'

import { useRef, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

interface LogoutState {
  success: boolean
  message: string
  issues: string[] | null
}

interface LogoutPageClientProps {
  logout: (prevState: LogoutState, data: FormData) => Promise<LogoutState>
}

export function LogoutPageClient({ logout }: LogoutPageClientProps) {
  const initialState: LogoutState = {
    success: false,
    message: '',
    issues: null,
  }

  const [state, formAction] = useActionState(logout, initialState)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  // Automatically redirect on successful logout
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state.success, router])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Logout</CardTitle>
        </CardHeader>
        <CardContent>
          {state.success ? (
            <div className="space-y-4">
              <div className="text-green-600">
                You have been successfully logged out.
              </div>
              <div className="text-muted-foreground text-sm">
                Redirecting to home page...
              </div>
            </div>
          ) : (
            <form ref={formRef} action={formAction} className="space-y-4">
              <div className="text-center">
                <p>Are you sure you want to logout?</p>
              </div>

              <Button type="submit" className="w-full">
                Confirm Logout
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Cancel
              </Button>

              {state.message && !state.success && (
                <div className="border-destructive/50 bg-destructive/10 text-destructive mt-4 flex items-center gap-2 rounded-md border p-3 text-sm">
                  <X className="h-4 w-4" />
                  <span>{state.message}</span>
                </div>
              )}

              {state.issues && state.issues.length > 0 && (
                <div className="space-y-2">
                  {state.issues.map((issue, index) => (
                    <div
                      key={index}
                      className="border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border p-3 text-sm"
                    >
                      <X className="h-4 w-4" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
