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
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  
  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    setIsLoading(true)
    setError(null)
    try {
      // await login(data.email, data.password)
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const [serverResponse, setServerResponse] = useState<string | null>(null)
  const {register, handleSubmit} = useForm<typeof LoginSchema>()
    
  const action: () => void = handleSubmit(async (email, password) => {
    const response = await login(email, password)
    console.log(response)
    // setServerResponse(response)
  })

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
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
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
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don't have an account? {' '}
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