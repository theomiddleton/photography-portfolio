'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Remark } from 'react-remark'
import { Icons } from '~/components/ui/icons'
import { v4 as uuidv4 } from 'uuid'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

import { CounterClockwiseClockIcon } from '@radix-ui/react-icons'

import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui/tabs'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Textarea } from '~/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"

import { blogWrite, blogFetch, blogEditFetch } from '~/lib/actions/blog'
import { BlogPosts } from '~/components/blog-posts'


export default function Blog() {

  // const { isAuthenticated, isLoading } = useKindeBrowserClient()
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  // need to prompt the user whether they want to edit or create a new post
  // if they want to edit, fetch the content of the post they want to edit
  // if they want to create a new post, just create a new post
  // need to pass the id of the post to edit to the blogEditFetch function
  
  // from blog. fetches data in server action, decides what to pass, then passses it
  // useEffect(() => {
    // const fetchData = async () => {
      // need to pass this an id of the blog post to edit
      // const data = await blogEditFetch()
      // const content = data.map(item => item.content).join('\n\n')
      // setContent(content)
      // setLoading(false)
    // }
    // void fetchData()
  // }, [])


  // if (isLoading) return <div>Loading...</div>

  // return isAuthenticated ? (
  return (
    <>
    <div className="md:hidden">
    </div>
    <div className="hidden h-full flex-col md:flex">
      <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
        <h2 className="text-lg font-semibold">Blog</h2>
      </div>
      <Separator />
      <div className="container h-full py-6">
        <div className="hidden flex-col space-y-3 sm:flex md:order-2">
          <Tabs defaultValue='write'>
            <TabsList>
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
            <TabsContent value="write">
              <div className="flex flex-col space-y-4">
                <div className="grid h-full gap-6 lg:grid-cols-2">
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-1 flex-col space-y-2">
                      <Label htmlFor="input">Post</Label>
                      <Textarea
                        id="input"
                        value={content}
                        className="flex-1 lg:min-h-[580px]"
                        onChange={({ currentTarget }) => setContent(currentTarget.value)}
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="title">Post Title</Label>
                      <Textarea
                        id="title"
                        placeholder="Title"
                        value={title}
                        onChange={({ currentTarget }) => setTitle(currentTarget.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-[21px] min-h-[400px] rounded-md border bg-muted lg:min-h-[700px] prose px-4">
                    <Remark>
                      {content}
                    </Remark>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={async () => { 
                    await blogWrite(content, title)
                  }}>Publish</Button>
                  <Button >Publish</Button>
                  <Button variant="secondary">
                    <span className="sr-only">Show history</span>
                    <CounterClockwiseClockIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary">Save</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="edit">
              <div className="flex flex-col space-y-4">
                <div className="grid h-full gap-6 lg:grid-cols-2">
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-1 flex-col space-y-2">
                      <Label htmlFor="input">Edit</Label>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">Select Post To Edit</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Select Post To Edit</DialogTitle>
                            <DialogDescription>
                              Input a posts Id to edit it. 
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="items-center">
                              <BlogPosts />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="id" className="text-right">
                                Id
                              </Label>
                              <Input
                                id="id"
                                defaultValue="1"
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Edit</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div> 
      </div> 
    </div>
    </>
  )

  // ) : (
    // <div className="h-screen flex flex-col pt-6 items-center">
      {/* <h1 className="text-2xl font-semibold">Unauthorized</h1> */}
      {/* <p className="mt-2">Sorry, But you don&apos;t have the permissions to view this page!</p> */}
    {/* </div> */}
  // )

}

export const runtime = 'edge';