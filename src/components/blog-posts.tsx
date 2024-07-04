import { useState, useEffect } from 'react'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

import { blogFetch } from '~/lib/actions/blog'

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
          <TableHead>Visible</TableHead>
        </TableRow> 
      </TableHeader>
      <TableBody>
        {posts.map((item) => (
          <TableRow key={item.id} onClick={() => setEditId(item.id)} className="cursor-pointer">
            <TableCell className="font-medium">{item.id}</TableCell>
            <TableCell>{item.title}</TableCell>
            <TableCell>{item.visible ? 'Yes' : 'No'}</TableCell>
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
