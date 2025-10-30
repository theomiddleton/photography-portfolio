'use client'

import React, { useRef, useActionState, useEffect, useState } from 'react'
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
  FormMessage,
} from '~/components/ui/form'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { PasswordInput } from '~/components/ui/password-input'
import Link from 'next/link'
import { registerSchema } from '~/lib/types/registerSchema'

import { PasswordRequirements } from './PasswordRequirements'

interface RegisterState {
  message: string
  fields?: Record<string, string>
  issues?: string[]
}

interface SignupFormProps {
  register: (prevState: RegisterState, data: FormData) => Promise<RegisterState>
}

export function SignupForm({ register }: SignupFormProps) {
  const [state, formAction] = useActionState(register, {
    message: '',
  })
  const [csrfToken, setCsrfToken] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const form = useForm<z.output<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      retypedPass: '',
      ...(state?.fields ?? {}),
    },
  })

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

  const formRef = useRef<HTMLFormElement>(null)

  // Show loading skeleton while CSRF token is loading
  if (!csrfToken) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-lg px-4 py-24">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">
                Sign Up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div>
                  <div className="bg-muted mb-2 h-4 w-16 rounded"></div>
                  <div className="bg-muted h-10 w-full rounded-md"></div>
                </div>
                <div>
                  <div className="bg-muted mb-2 h-4 w-16 rounded"></div>
                  <div className="bg-muted h-10 w-full rounded-md"></div>
                </div>
                <div>
                  <div className="bg-muted mb-2 h-4 w-20 rounded"></div>
                  <div className="bg-muted h-10 w-full rounded-md"></div>
                </div>
                <div>
                  <div className="bg-muted mb-2 h-4 w-32 rounded"></div>
                  <div className="bg-muted h-10 w-full rounded-md"></div>
                </div>
                <div className="bg-muted h-10 w-full rounded-md"></div>
                <div className="bg-muted h-16 w-full rounded-md"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-12">
      <div className="mx-auto max-w-lg px-4 py-24">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Sign Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              {state?.message !== '' && !state.issues && (
                <div className="text-center text-red-500">{state.message}</div>
              )}
              {state?.issues && (
                <div className="text-red-500">
                  <ul>
                    {state.issues.map((issue) => (
                      <li key={issue} className="flex gap-1">
                        <X fill="red" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <form
                ref={formRef}
                className="space-y-4"
                action={formAction}
                onSubmit={(evt) => {
                  evt.preventDefault()
                  form.handleSubmit(() => {
                    formAction(new FormData(formRef.current!))
                  })(evt)
                }}
              >
                <input type="hidden" name="csrf-token" value={csrfToken} />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">Name</FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          placeholder="first name last name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="mail@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          placeholder="**********"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            setPasswordValue(e.target.value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      {/* Show password requirements in real-time */}
                      {passwordValue && (
                        <div className="mt-2">
                          <PasswordRequirements password={passwordValue} />
                        </div>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="retypedPass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="retypedPass">
                        Reenter your password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="retypedPass"
                          placeholder="**********"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-2">
                  <Button
                    variant="default"
                    type="submit"
                    className="w-full"
                    disabled={!csrfToken}
                  >
                    Register
                  </Button>
                </div>

                {/* Email Verification Notice */}
                <div className="border-border bg-muted/50 rounded-md border p-3">
                  <p className="text-muted-foreground text-sm">
                    📧 After registration, you&apos;ll need to verify your email
                    address before logging in. Please check your inbox for a
                    verification link.
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <Link href="/signin" className="text-foreground hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
