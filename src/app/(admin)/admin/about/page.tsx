'use client'
import { useEffect, useState } from 'react'
import { Remark } from 'react-remark'
import { Icons } from '~/components/ui/icons'

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
import { Textarea } from '~/components/ui/textarea'

import { read, update } from '~/lib/actions/about'


export default function AboutGenerator() {
    
    //const { isAuthenticated, isLoading } = useKindeBrowserClient()

    const [markdownSource, setMarkdownSource] = useState(null)
    const [title, setTitle] = useState(null)
    const [content, setContent] = useState(null)


    const doNothing = async (e: React.MouseEvent<HTMLButtonElement>) => {
      console.log('do nothing')
      console.log()
    }

    const upload = async (e: React.MouseEvent<HTMLButtonElement>) => {
      const data = {
        content: markdownSource,
      }
    
      try {
        const response = await update(data)
        console.log(response)
      } catch (error) {
        console.error(error)
      }
    }

  return (
    <div className="">
      <div className="hidden h-full flex-col md:flex">
        <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
          <h2 className="text-lg font-semibold">About</h2>
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
                    <TabsTrigger value="edit">
                      <span className="sr-only">Edit</span>
                      <Icons.edit />
                    </TabsTrigger>
                  </TabsList>
                </div>
            </div>

              <div className="md:order-1">
                <TabsContent value="edit" className="mt-0 border-0 p-0">
                  <div className="flex flex-col space-y-4">
                    <div className="grid h-full grid-rows-2 gap-6 lg:grid-cols-2 lg:grid-rows-1">
                      <Textarea
                        placeholder="Write your about me page here"
                        className="h-full min-h-[300px] lg:min-h-[700px] xl:min-h-[700px]"
                        onChange={({ currentTarget }) => setMarkdownSource(currentTarget.value)}
                      />
                      <div className="flex flex-2 flex-col space-y-2">
                        <div className="rounded-md border flex-1 lg:min-h-[580px] bg-muted prose">
                          <Remark>{markdownSource}</Remark>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="title">Current</Label>
                            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"/>
                            owaj
                          </div>
                      </div>
                      </div>
                    <div className="flex items-center space-x-2">
                      <Button onClick={upload}>Submit</Button>
                      <Button variant="secondary">
                        <span className="sr-only">Show history</span>
                        <CounterClockwiseClockIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}