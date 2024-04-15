'use client'
import React from 'react'
import { useState } from 'react'
import { Icons } from '~/components/ui/icons'
import { Button } from '~/components/ui/button'
import { redirect } from 'next/navigation'

import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/components'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

export default function Admin() {

    const [email, setEmail] = useState('') 
    const [password, setPassword] = useState('') 

return (
    <div className="min-h-screen bg-white text-black space-y-12">
        <div className="max-w-2xl mx-auto py-24 px-4">
                <h2 className="text-base font-semibold leading-7 text-black">
                    Sign Up
                </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                    <Card className="mt-2 justify-center w-full">
                        <CardHeader>
                            <CardTitle>Sign Up</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form>
                                <div className="grid w-full items-center gap-4">
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="name">Email</Label>
                                        <Input id="email" placeholder="example@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" placeholder="**********" value={password} onChange={(e) => setPassword(e.target.value)} />  
                                    </div>
                                    <div className="flex justify-between">
                                        <RegisterLink className="bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 mx-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                            authUrlParams={{
                                                connection_id: "conn_72858762b57045f286bff8ffff030550"
                                            }}>
                                            <Icons.discord className="flex align-middle justify-center w-5 h-5 pr-1"/>
                                            Sign Up With Discord
                                        </RegisterLink>
                                        <RegisterLink className="bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 mx-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                            authUrlParams={{
                                                connection_id: 'conn_1d769022b0874cb3bbe66f5ff612dece'
                                            }}>
                                            <Icons.gitHub className="flex align-middle justify-center w-5 h-5 pr-1"/>
                                            Sign Up With GitHub
                                        </RegisterLink>
                                        <RegisterLink className="bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 mx-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                                authUrlParams={{
                                                    connection_id: "conn_617fe5f7c33f4d038116e082e5d34413"
                                                }}>
                                            <Icons.microsoft className="flex align-middle justify-center w-5 h-5 pr-1"/>
                                            Sign Up With Microsoft
                                        </RegisterLink>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant='secondary' type='submit' onClick={() => redirect('/signin')}>Sign in</Button>
                            <RegisterLink className="bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 mx-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">Sign Up</RegisterLink>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    </div>

    )
}
