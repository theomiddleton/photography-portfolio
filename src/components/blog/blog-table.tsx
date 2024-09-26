'use client'

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
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '~/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu' 
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

import { DeletePostDialog } from '~/components/blog/blog-dialogs'
import { deletePost, getPosts } from '~/lib/actions/blog'

interface Post {
  id: number
  title: string
  content: string
  isDraft: boolean
  createdAt: Date
}

const posts = [
  {
    id: 1,
    title: 'The quick brown fox jumps over the lazy dog',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec turpis nec nunc tincidunt ultricies. Nullam nec turpis nec nunc tincidunt ultricies. Nullam nec turpis nec nunc tincidunt ultricies.',
    draft: false,
    createdAt: '2024-09-01T12:00:00Z',
  },
  {
    id: 2,
    title: 'The quick brown fox jumps over the lazy dog',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec turpis nec nunc tincidunt ultricies. Nullam nec turpis nec nunc tincidunt ultricies. Nullam nec turpis nec nunc tincidunt ultricies.',
    draft: true,
    createdAt: '2024-09-01T12:00:00Z',
  },
  {
    id: 3,
    title: 'Text other than just the title',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec turpis nec nunc tincidunt ultricies. Nullam nec turpis nec nunc tincidunt ultricies. Nullam nec turpis nec nunc tincidunt ultricies.',
    draft: false,
    createdAt: '2024-09-01T12:00:00Z',
  }
]

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function BlogsTable() {
  const [posts, setPosts] = useState<Post[]>([])
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)
  
  useEffect(() => {
    fetchPosts()
  }, [])
  
  const fetchPosts = async () => {
    const fetchedPosts = await getPosts()
    setPosts(fetchedPosts)
  }
  
  const handleDeletePost = async (postId: number) => {
    await deletePost(postId)
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
    setPostToDelete(null)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Posts</CardTitle>
        <CardDescription>All post posts and drafts</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.id}</TableCell>
                <TableCell>{truncateText(post.title, 30)}</TableCell>
                <TableCell>{truncateText(post.content, 50)}</TableCell>
                <TableCell>
                  <Badge variant={post.isDraft ? 'secondary' : 'outline'}>
                    {post.isDraft ? 'Draft' : 'Published'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(post.createdAt).toLocaleString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <a href={`/admin/store/${post.id}`}>
                          Edit
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPostToDelete(post)}>
                        Delete post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{posts.length}</strong> of <strong>{posts.length}</strong> posts
        </div>
      </CardFooter>
    
      <DeletePostDialog
        postToDelete={postToDelete}
        onCancel={() => setPostToDelete(null)}
        onDelete={handleDeletePost}
      />
    </Card>
  )
}
