'use client'

import { React, useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '~/components/ui/form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from "~/lib/auth"

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64),
})

export default function Signin() {
  
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  
  async function onSubmit(data: z.output<typeof LoginSchema>) {
    console.log('swaggggg')
    
    await login(data.email, data.password)
  }
  
  return (
    <div className="min-h-screen bg-white text-black space-y-12">
      <div className="max-w-md mx-auto py-24 px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <div className="pt-2">
                  <Button 
                    variant="default" 
                    type="submit" 
                    className="w-full" 
                  >
                    Login
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account? {' '}
              <Link href='/signup' className='text-slate-950 hover:underline'>
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}