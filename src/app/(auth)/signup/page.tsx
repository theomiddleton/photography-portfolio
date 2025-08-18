'use client'

import React, { useRef, useActionState } from 'react'
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
  FormMessage,
} from '~/components/ui/form'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import Link from 'next/link'

import { registerSchema } from '~/lib/types/registerSchema'

import { register } from '~/lib/auth/userActions'

export default function Signup() {
  const [state, formAction] = useActionState(register, {
    message: '',
  })
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

  const formRef = useRef<HTMLFormElement>(null)

  return (
    <div className="min-h-screen space-y-12">
      <div className="max-w-md mx-auto py-24 px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
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
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Name</FormLabel>
                      <FormControl>
                        <Input id="name" placeholder="first name last name" {...field} />
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
                        <Input id="email" placeholder="example@domain.com" {...field} />
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
                        <Input id="password" type="password" placeholder="**********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="retypedPass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="retypedPass">Reenter your password</FormLabel>
                      <FormControl>
                        <Input id="retypedPass" type="password" placeholder="**********" {...field} />
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
                  >
                    Register
                  </Button>
                </div>
                
                {/* Email Verification Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    📧 After registration, you'll need to verify your email address before logging in.
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Already have an account? {' '}
              <Link href='/signin' className='text-slate-950 hover:underline'>
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}