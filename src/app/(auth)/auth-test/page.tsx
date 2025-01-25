import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { getSession } from '~/lib/auth/auth'

export default async function AuthCheck() {
  const session = await getSession()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <pre className="w-full overflow-auto text-sm bg-gray-50 p-2 rounded">
            {JSON.stringify(session, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}