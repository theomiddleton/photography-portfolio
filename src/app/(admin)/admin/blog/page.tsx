'use client'
import Image from 'next/image'
import { useState } from 'react'
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

import { useCookies } from 'next-client-cookies'
import { create, read } from '~/lib/actions/cookies'

export default function Blog() {

  //const { isAuthenticated, isLoading } = useKindeBrowserClient()
  const [file, setFile] = useState<File | null>(null)
  const [markdownSource, setMarkdownSource] = useState('')
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [visable, setVisable] = useState(false)
  const [description, setDescription] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [markdownLink, setMarkdownLink] = useState('')
  const cookies = useCookies();

  const handleFetch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    
    const response = await fetch(
      '/api/blog-fetch/',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    console.log('Response:', response)

  }

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const tempId = uuidv4()
    const cookie = await create({ tempId })
    console.log('Cookie:', cookie)

    setVisable(false)

    const isSaved = await cookies.get({ tempId: '' })
    console.log('Cookie:', isSaved)

    if (isSaved && isSaved.tempId) {

      const response = await fetch(
        '/api/blog-fetch/',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('TempId cookie exists:', isSaved.tempId)

    } else {
      console.log('TempId cookie does not exist or is empty')
    }

    const response = await fetch(
      '/api/blog-fetch/',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    console.log('Response:', response)

    const draft = await fetch(
      '/api/blog',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, visable, tempId }),
      }
    )
    //we need to ensure when the save button is pressed, the id is stored, and it only writes to that id in the db, not a new row
    //create a new column in the db for a temp id, 
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const currentFile = event.target.files[0]
      setFile(currentFile)
    }
  }

  const handleBlogUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {

    await handleSave(e)
    const data = await fetch(
      '/api/blog',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, visable }),
      }
    )
  }

  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    //console.log('uploading')
    e.preventDefault()
    setUploading(true)
    setVisable(true)

    const response = await fetch(
      '/api/blog-img',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      }
    )

    if (response.ok) {
      const { url } = await response.json()
      //console.log('Got pre-signed URL:', url)
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (uploadResponse.ok) {
        alert('Upload successful!')
        fetchImages()
      } else {
        console.error('R2 Upload Error:', uploadResponse)
        alert('Upload failed.')
      }
    } else {
      alert('Failed to get pre-signed URL.')
    }
    setUploading(false)
  }

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/blog-img-fetch/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (data.result && data.result.length > 0) {
        const fileUrl = data.result[0].fileUrl
        // const fileDescription = data.result[0].description
        console.log('File URL:', fileUrl)
        const newMarkdownLink = `![ ](${fileUrl})`
        setMarkdownLink(newMarkdownLink)
        await navigator.clipboard.writeText(newMarkdownLink)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    }
  }

  //if (isLoading) return <div>Loading...</div>

  // return isAuthenticated ? (
  return (
    <>
      <div className="md:hidden">
      </div>
      <div className="hidden h-full flex-col md:flex">
        <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
          <h2 className="text-lg font-semibold">Blog</h2>
          <div className="ml-auto flex w-full space-x-2 sm:justify-end">

          </div>
        </div>
        <Separator />
        <Tabs defaultValue="edit" className="flex-1">
          <div className="container h-full py-6">
            <div className="grid h-full items-stretch gap-6 md:grid-cols-[1fr_200px]">
              <div className="hidden flex-col space-y-4 sm:flex md:order-2">
                <div className="grid gap-2">
                      <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Mode
                      </span>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="insert">
                      <span className="sr-only">Insert</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-5 w-5"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M14.491 7.769a.888.888 0 0 1 .287.648.888.888 0 0 1-.287.648l-3.916 3.667a1.013 1.013 0 0 1-.692.268c-.26 0-.509-.097-.692-.268L5.275 9.065A.886.886 0 0 1 5 8.42a.889.889 0 0 1 .287-.64c.181-.17.427-.267.683-.269.257-.002.504.09.69.258L8.903 9.87V3.917c0-.243.103-.477.287-.649.183-.171.432-.268.692-.268.26 0 .509.097.692.268a.888.888 0 0 1 .287.649V9.87l2.245-2.102c.183-.172.432-.269.692-.269.26 0 .508.097.692.269Z"
                          fill="currentColor"
                        ></path>
                        <rect
                          x="4"
                          y="15"
                          width="3"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="8.5"
                          y="15"
                          width="3"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="13"
                          y="15"
                          width="3"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                      </svg>
                    </TabsTrigger>
                    <TabsTrigger value="edit">
                      <span className="sr-only">Edit</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-5 w-5"
                      >
                        <rect
                          x="4"
                          y="3"
                          width="12"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="4"
                          y="7"
                          width="12"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="4"
                          y="11"
                          width="3"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="4"
                          y="15"
                          width="4"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <rect
                          x="8.5"
                          y="11"
                          width="3"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        ></rect>
                        <path
                          d="M17.154 11.346a1.182 1.182 0 0 0-1.671 0L11 15.829V17.5h1.671l4.483-4.483a1.182 1.182 0 0 0 0-1.671Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex flex-col space-y-2">
                  <Card className="mt-2 justify-center w-full">
                    <CardHeader>
                      <CardTitle>Upload images</CardTitle>
                      {/* <CardDescription>.</CardDescription> */}
                    </CardHeader>
                    <CardContent>
                      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-black/25 px-6 py-10">
                        <div className="text-center">
                          <Icons.imageIcon
                            className="mx-auto h-12 w-12 text-gray-500"
                            aria-hidden="true"
                          />
                          <div className="mt-4 text-sm leading-6 text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-gray-100 font-semibold text-black focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 hover:text-gray-500"
                            >
                              <span>Upload a file</span>
                              <input
                                type="file"
                                accept="image/jpeg, image/png"
                                id="file-upload"
                                name="file-upload"
                                className="sr-only"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                          <p className="text-xs leading-5 text-gray-600">
                            {file?.name ? file.name : 'JPEG up to 100MB'}
                          </p>
                        </div>
                      </div>
                      <form>
                        <div className="grid w-full items-center gap-4">
                          <span/>
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" placeholder="Description of the image" value={description} onChange={(e) => setDescription(e.target.value)} />
                          </div>
                        </div>
                      </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <Button type="submit" onClick={handleUpload}>Upload</Button>
                      {/* <Button type="submit" onClick={fetchImages}>Fetch</Button> */}
                    </CardFooter>
                    <div className='flex justify-center pb-4 break-all'>{markdownLink}</div>
                  </Card>
                  
                  <Card className="mt-2 justify-center w-full">
                    <CardHeader>
                      <CardTitle>Fetch</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <Button type="submit" onClick={handleFetch}>Fetch</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="md:order-1">
                <TabsContent value="insert" className="mt-0 border-0 p-0">
                  <div className="flex flex-col space-y-4">
                    <div className="grid h-full grid-rows-2 gap-6 lg:grid-cols-2 lg:grid-rows-1">
                      <Textarea
                        placeholder="Side by side placeholder"
                        className="h-full min-h-[300px] lg:min-h-[700px] xl:min-h-[700px]"
                        onChange={({ currentTarget }) => setMarkdownSource(currentTarget.value)}
                      />
                      <div className="rounded-md border bg-muted prose">
                        <Remark>{markdownSource}</Remark>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button>Submit</Button>
                      <Button variant="secondary">
                        <span className="sr-only">Show history</span>
                        <CounterClockwiseClockIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="edit" className="mt-0 border-0 p-0">
                  <div className="flex flex-col space-y-4">
                    <div className="grid h-full gap-6 lg:grid-cols-2">
                      <div className="flex flex-col space-y-4">
                        <div className="flex flex-1 flex-col space-y-2">
                          <Label htmlFor="input">Post</Label>
                          <Textarea
                            id="input"
                            placeholder="Write your post in markdown here"
                            className="flex-1 lg:min-h-[580px]"
                            onChange={({ currentTarget }) => {
                              setMarkdownSource(currentTarget.value)
                              setContent(currentTarget.value)
                            }}
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
                      <div className="mt-[21px] min-h-[400px] rounded-md border bg-muted lg:min-h-[700px] prose px-4" >
                        <Remark>
                            {markdownSource}
                        </Remark>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button onClick={handleBlogUpload}>Publish</Button>
                      <Button variant="secondary">
                        <span className="sr-only">Show history</span>
                        <CounterClockwiseClockIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" onClick={handleSave}>Save</Button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </>
    // ) : (
        // <div>
          // {/* Sorry, But you dont have the permissions to view this page! */}
        // {/* </div> */}
      )
}