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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginSchema } from '~/lib/types/loginSchema'
import { generateCSRFTokenWithCookie } from '~/lib/csrf-protection'

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
    void generateCSRFTokenWithCookie().then(setCsrfToken)
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
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card ref={cardRef} className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form action={formAction} className="grid gap-4">
                <input type="hidden" name="csrfToken" value={csrfToken} />

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
                        <Input
                          {...field}
                          id="password"
                          name="password"
                          type="password"
                          required
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </Form>

            {state.message && (
              <div className="border-destructive/50 bg-destructive/10 text-destructive mt-4 flex items-center gap-2 rounded-md border p-3 text-sm">
                <X className="h-4 w-4" />
                <span>{state.message}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
