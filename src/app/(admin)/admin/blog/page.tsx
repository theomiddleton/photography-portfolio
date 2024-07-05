'use client'
import { useState, useEffect } from 'react'
import { Remark } from 'react-remark'

import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui/tabs'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '~/components/ui/dialog'

import { BlogPosts } from '~/components/blog-posts'

import { blogEdit, blogEditFetch, blogWrite, blogEditFetchDebug } from '~/lib/actions/blog'

import { NotAuthenticated } from '~/components/not-authenticated'

export default function Blog() {

  // const { isAuthenticated, isLoading } = useKindeBrowserClient()

  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(true)

  const [editTitle, setEditTitle] = useState<string>('')
  const [editContent, setEditContent] = useState<string>('')
  const [editIsVisible, setEditIsVisible] = useState<boolean>(true)

  const [editId, setEditId] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState('write')
  
  const handleCheckboxChange = (event) => {
    setIsVisible(event.target.checked)
  }

  const handleEditCheckboxChange = (event) => {
    setEditIsVisible(event.target.checked)
  }

  useEffect(() => {
    setLoading(false)
  }, [])

  const handleEdit = async (event) => {
    event.preventDefault()
    if (editId) { 
      setLoading(true)
      const data = await blogEditFetchDebug(editId) as { id: number; title: string; content: string; visible: boolean}
      setEditContent(data.content)
      setEditTitle(data.title)
      setEditIsVisible(data.visible)
      setLoading(false)
    } else {
      console.error("No post selected for editing")
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center">Loading content...</div>

  // if (isLoading) return <div className="h-screen flex items-center justify-center">Loading auth...</div>

  return (
    <>
      <div className="hidden h-full flex-col md:flex">
        <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
          <h2 className="text-lg font-semibold">Blog</h2>
          <div className="ml-auto flex w-full space-x-2 sm:justify-end">
            <div className="hidden space-x-2 md:flex">
            </div>
          </div>
        </div>
        <Separator />
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="write" className="flex-1">
          <div className="container h-full py-6">
              <span className="text-sm font-medium leading-none">
                Mode
              </span>
              <div className="flex items-center space-x-2">
                <TabsList className="grid grid-cols-2 pd-2">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>
              </div>
            <div className="grid h-full items-stretch gap-6 md:grid-cols-1 mt-4">
              <div className="hidden flex-col space-y-4 sm:flex md:order-2">
              </div>
              <div className="md:order-1">
                <TabsContent value="write" className="mt-0 border-0 p-0">
                  <div className="flex flex-col space-y-4">
                    <div className="grid h-full gap-6 lg:grid-cols-2">
                      <div className="flex flex-col space-y-4">
                        <div className="flex flex-1 flex-col space-y-2">
                          <Label>Post</Label>
                          <Textarea
                            id="input"
                            value={content}
                            placeholder="Write your blog post here"
                            className="flex-1 lg:min-h-[580px]"
                            onChange={({ currentTarget }) => setContent(currentTarget.value)}
                          />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label htmlFor="instructions">Post Title</Label>
                          <Textarea
                            id="title"
                            placeholder="Write your title here"
                            value={title}
                            onChange={({ currentTarget }) => setTitle(currentTarget.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-[21px] min-h-[400px] rounded-md border bg-muted lg:min-h-[700px] prose">
                        <Remark>
                          {content}
                        </Remark>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button onClick={async () => {
                        await blogWrite(content, title, isVisible)
                      }}>Publish</Button>
                      <input 
                        className="peer size-6 shrink-0 rounded-sm border border-primary shadow accent-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        type="checkbox" 
                        id="visible" 
                        checked={isVisible} 
                        onChange={handleCheckboxChange}
                      />
                        <label
                          htmlFor="visible"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Visible?
                        </label>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="edit" className="mt-0 border-0 p-0">
                  <Label>Edit</Label>
                  <div className="px-4 py-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Select Post To Edit</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Select Post To Edit</DialogTitle>
                          <DialogDescription>
                            Click a post to edit it 
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="items-center">
                            <BlogPosts setEditId={setEditId} />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="id" className="text-right">
                              Id
                            </Label>
                            <Input
                              id="id"
                              value={editId}
                              className="col-span-3"
                              onChange={({ currentTarget }) => setEditId(Number(currentTarget.value))}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="submit" onClick={(event) => {
                              handleEdit(event)
                              event.preventDefault()
                            }}>
                                Edit
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div className="grid h-full grid-rows-2 gap-6 lg:grid-cols-2 lg:grid-rows-1">
                      <Textarea
                        className="h-full min-h-[300px] lg:min-h-[700px] xl:min-h-[700px]"
                        id="input"
                        value={editContent}
                        onChange={({ currentTarget }) => setEditContent(currentTarget.value)}
                      />
                      <div className="rounded-md border bg-muted prose">
                        <Remark>
                          {editContent}
                        </Remark>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button onClick={async () => {
                        await blogEdit(editId, editContent, editTitle, editIsVisible)
                      }}>Save</Button>
                      <input 
                        className="peer size-6 shrink-0 rounded-sm border border-primary shadow accent-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        type="checkbox" 
                        id="visible" 
                        checked={editIsVisible} 
                        onChange={handleEditCheckboxChange}
                      />
                      <label
                          htmlFor="visible"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Visible?
                      </label>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </>
  )

  // ) : (
  //   <NotAuthenticated />
  // )
}