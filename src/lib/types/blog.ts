import { type BlogPost } from '~/server/db/schema'

export interface BlogPostPreview {
  id: string
  title: string
  description: string | null
  slug: string
  publishedAt: Date | null
}
