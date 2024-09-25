import { BlogsTable } from '~/components/blog/blog-table'

export const revalidate = 60
export const dynamicParams = true

export default function Blog() {
  return (
    <div className="min-h-screen bg-white text-black space-y-12">
      <BlogsTable />
    </div>
  )
}
