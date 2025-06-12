'use client'

import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { Edit } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ClientSession {
  role?: string
}

async function getClientSideSession(): Promise<ClientSession | null> {
  try {
    const res = await fetch('/api/auth/session')
    if (res.ok) {
      const sessionData = await res.json()
      return sessionData
    }
    return null
  } catch (error) {
      console.error('Error fetching client-side session:', error)
    return null
  }
}

interface EditPostButtonClientProps {
  slug: string
}

export function EditPostButtonClient({ slug }: EditPostButtonClientProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAdminStatus() {
      setIsLoading(true)
      const clientSession = await getClientSideSession()
      if (clientSession && clientSession.role === 'admin') {
        setIsAdmin(true)
      }
      setIsLoading(false)
    }
    checkAdminStatus()
  }, [])

  if (isLoading) {
    return null
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Link href={`/admin/blog/edit/${slug}`}>
      <Button variant="outline" size="sm">
        <Edit className="mr-2 h-4 w-4" />
        Edit post
      </Button>
    </Link>
  )
}
