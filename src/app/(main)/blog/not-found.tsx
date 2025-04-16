import Link from 'next/link'
import { Button } from '~/components/ui/button'

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">404 - Not Found</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        The blog post you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-8">
        <Link href="/blog">Back to Blog</Link>
      </Button>
    </div>
  )
}
