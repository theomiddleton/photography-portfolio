import { ImageOff } from 'lucide-react'

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message = 'No images found' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted rounded-full p-3 mb-4">
        <ImageOff className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{message}</h3>
      <p className="text-muted-foreground mt-1">Upload some images to get started.</p>
    </div>
  )
}
