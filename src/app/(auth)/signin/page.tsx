'use client'

import { useRef, useEffect, useActionState, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import type { z } from 'zod'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
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

import { login } from '~/lib/auth/userActions'

export default function Signin() {
  const router = useRouter()
  const [state, formAction] = useActionState(login, {
    message: '',
    redirect: null,
  })
  const [csrfToken, setCsrfToken] = useState('')
  const form = useForm<z.output<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(state?.fields ?? {}),
    },
  })
  
  useEffect(() => {
    generateCSRFTokenWithCookie().then(setCsrfToken).catch(console.error)
  }, [])
  
  useEffect(() => {
    if (state.redirect) {
      router.push(state.redirect)
    }
  }, [state.redirect, router])

  const formRef = useRef<HTMLFormElement>(null)

  // Show loading skeleton while CSRF token is loading
  if (!csrfToken) {
    return (
      <div className="min-h-screen">
        <div className="max-w-md mx-auto py-24 px-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 animate-pulse">
                <div>
                  <div className="mb-2 h-4 w-16 rounded bg-muted"></div>
                  <div className="h-10 w-full rounded-md bg-muted"></div>
                </div>
                <div>
                  <div className="mb-2 h-4 w-20 rounded bg-muted"></div>
                  <div className="h-10 w-full rounded-md bg-muted"></div>
                </div>
                <div className="h-4 w-32 rounded bg-muted"></div>
                <div className="h-10 w-full rounded-md bg-muted"></div>
                <div className="h-4 w-28 rounded bg-muted"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-12">
      <div className="max-w-md mx-auto py-24 px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input id="email" placeholder="example@domain.com" {...field} />
                      </FormControl>
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
                        <Input id="password" type="password" placeholder="**********" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-ring focus:ring-2"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                    Remember me for 30 days
                  </label>
                </div>
                
                <div className="pt-2">
                  <Button 
                    variant="default" 
                    type="submit" 
                    className="w-full" 
                    disabled={!csrfToken}
                  >
                    Login
                  </Button>
                </div>
                
                {/* Forgot Password Link */}
                <div className="text-center">
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account? {' '}
              <Link href='/signup' className='text-foreground hover:underline'>
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}