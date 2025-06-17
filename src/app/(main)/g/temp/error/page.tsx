import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Temporary Link Error',
}

export default function TempLinkErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="text-6xl mb-4">🔗</div>
        <h1 className="text-2xl font-bold mb-4">Temporary Link Issues</h1>
        <div className="text-muted-foreground space-y-3">
          <p>This temporary link may have:</p>
          <ul className="text-left list-disc list-inside space-y-1">
            <li>Expired</li>
            <li>Already been used up</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
