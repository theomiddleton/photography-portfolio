import { useState, useEffect } from 'react'

import { blogFetch } from "~/lib/actions/blog"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"


const placeholder = [
    {
      id: "1",
      title: "Placeholder Title 1",
    },
    {
      id: "2",
      title: "Placeholder Title 2",
    },
    {
      id: "3",
      title: "Placeholder Title 3",
    },
    {
      id: "4",
      title: "Placeholder Title 4",
    },
    {
      id: "5",
      title: "Placeholder Title 5",
    },
    {
      id: "6",
      title: "Placeholder Title 6",
    },
    {
      id: "7",
      title: "Placeholder Title 7",
    },
  ]

export function BlogPosts() {
  const [posts, setPosts] = useState([])


  useEffect(() => {
      const fetchPosts = async () => {
        const result = await blogFetch()
        setPosts(result)
      }
      fetchPosts()
  }, [])

  return (
      <Table>
          <TableCaption>Blog Posts</TableCaption>
          <TableHeader>
              <TableRow>
                  <TableHead className="w-[100px]">Id</TableHead>
                  <TableHead>Title</TableHead>
              </TableRow> 
          </TableHeader>
          <TableBody>
              {placeholder.map((item) => (
                  <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.title}</TableCell>
                  </TableRow>
              ))}
          </TableBody>
          <TableFooter>
              <TableRow>
                  <TableCell colSpan={2}>Total: {placeholder.length}</TableCell>
              </TableRow>
          </TableFooter>
      </Table>
  )
}
