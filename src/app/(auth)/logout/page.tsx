'use client'

import { useRef, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { logout } from '~/lib/auth/userActions'
import { SiteHeader } from '~/components/site-header'
import { SiteFooter } from '~/components/site-footer'

const initialState = {
  success: false,
  message: '',
  issues: null,
}

export default function LogoutPage() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useFormState(logout, initialState)

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/')
      }, 1500) // wait 1.5 seconds before redirecting to the home page
  
      // clear the timer
      return () => clearTimeout(timer)
    }
  }, [state.success, router])

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SiteHeader />
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Log Out</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">
            Are you sure you want to log out of your account?
          </p>
          {state?.message !== '' && !state.issues && (
            <div className={`text-center mb-4 ${state.success ? 'text-green-500' : 'text-red-500'}`}>
              {state.message}
            </div>
          )}
          {state?.issues && (
            <div className="text-red-500 mb-4">
              <ul>
                {state.issues.map((issue) => (
                  <li key={issue} className="flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <form
            ref={formRef}
            action={formAction}
          >
            <div className="flex justify-center space-x-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Log Out
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <SiteFooter />
    </div>
  )
}