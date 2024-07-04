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



export function BlogPosts({ setEditId }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
      const fetchPosts = async () => {
        setLoading(true)
        const result = await blogFetch()
        setPosts(result)
        setLoading(false)
      }
      fetchPosts()
  }, [])

  if (loading) return <div className="h-screen flex items-center justify-center">Loading content...</div>

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
        {posts.map((item) => (
          // Attach onClick event to each TableRow
          <TableRow key={item.id} onClick={() => setEditId(item.id)} className="cursor-pointer">
            <TableCell className="font-medium">{item.id}</TableCell>
            <TableCell>{item.title}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total: {posts.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
