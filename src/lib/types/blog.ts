import { type BlogPost, type BlogImage } from '~/server/db/schema'

export interface BlogPostWithImages extends BlogPost {
  images?: BlogImage[]
}

export interface BlogPostPreview {
  id: string
  title: string
  description: string | null
  slug: string
  publishedAt: Date | null
}
