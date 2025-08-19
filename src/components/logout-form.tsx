'use client'

import { useActionState } from 'react'
import { logout } from '~/lib/auth/userActions'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'

export function LogoutForm() {
  const [state, action] = useActionState(logout, {
    success: false,
    message: '',
    issues: null,
  })

  return (
    <form action={action}>
      <DropdownMenuItem asChild>
        <button type="submit" className="w-full cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </button>
      </DropdownMenuItem>
    </form>
  )
}