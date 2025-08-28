'use client'

import { useRef, useEffect, useActionState, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import type { z } from 'zod'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '~/components/ui/form'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { PasswordInput } from '~/components/ui/password-input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginSchema } from '~/lib/types/loginSchema'


interface SigninFormProps {
  login: (prevState: any, data: FormData) => Promise<any>
}

export function SigninForm({ login }: SigninFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(login, {
    message: '',
    redirect: null,
  })

  const [csrfToken, setCsrfToken] = useState('')
  const [isFirstAttempt, setIsFirstAttempt] = useState(true)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Generate CSRF token on component mount
  useEffect(() => {
    async function fetchCsrfToken() {
      try {
        const response = await fetch('/api/csrf-token')
        const data = await response.json()
        if (data.success) {
          setCsrfToken(data.token)
        } else {
          console.error('Failed to fetch CSRF token:', data.error)
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error)
      }
    }
    fetchCsrfToken()
  }, [])

  // Handle redirect if login is successful
  useEffect(() => {
    if (state.redirect) {
      router.push(state.redirect)
    }
  }, [state.redirect, router])

  const cardRef = useRef<HTMLDivElement>(null)

  // Animate card on error
  useEffect(() => {
    if (state.message && !isFirstAttempt && cardRef.current) {
      cardRef.current.style.animation = 'none'
      cardRef.current.offsetHeight // Trigger reflow
      cardRef.current.style.animation = 'shake 0.5s ease-in-out'
    }
    if (state.message) {
      setIsFirstAttempt(false)
    }
  }, [state.message, isFirstAttempt])

  // Show loading skeleton while CSRF token is loading
  if (!csrfToken) {
    return (
      <>
        <style jsx>{`
          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-5px);
            }
            75% {
              transform: translateX(5px);
            }
          }
        `}</style>
        <div className="min-h-screen space-y-12">
          <div className="mx-auto max-w-lg px-4 py-24">
            <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div>
                  <div className="bg-muted mb-2 h-4 w-16 rounded"></div>
                  <div className="bg-muted h-10 w-full rounded-md"></div>
                </div>
                <div>
                  <div className="bg-muted mb-2 h-4 w-20 rounded"></div>
                  <div className="bg-muted h-10 w-full rounded-md"></div>
                </div>
                <div className="bg-muted h-6 w-40 rounded"></div>
                <div className="bg-muted h-10 w-full rounded-md"></div>
              </div>
            </CardContent>
            <CardFooter className="text-center text-sm">
              <div className="bg-muted h-4 w-48 rounded"></div>
            </CardFooter>
          </Card>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
      `}</style>
      <div className="min-h-screen space-y-12">
        <div className="mx-auto max-w-lg px-4 py-24">
          <Card ref={cardRef} className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form action={formAction} className="grid gap-4">
                <input type="hidden" name="csrf-token" value={csrfToken} />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="email"
                          name="email"
                          type="email"
                          placeholder="m@example.com"
                          required
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <div className="flex items-center">
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          id="password"
                          name="password"
                          required
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Remember me for 30 days
                  </label>
                </div>

                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </Form>{' '}
            {state.message && (
              <div className="border-destructive/50 bg-destructive/10 text-destructive mt-4 flex items-center gap-2 rounded-md border p-3 text-sm">
                <X className="h-4 w-4" />
                <span>{state.message}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-center text-sm">
            Don&apos;t have an account? {' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </CardFooter>
        </Card>
        </div>
      </div>
    </>
  )
}
