'use client'

import { useActionState } from 'react'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'

interface LogoutState {
  success: boolean
  message: string
  issues: string[] | null
}

interface LogoutFormProps {  
  logout: (prevState: LogoutState, data: FormData) => Promise<LogoutState>  
  csrfToken?: string  
}  

export function LogoutForm({ logout }: LogoutFormProps) {
  const [_state, action] = useActionState(logout, {
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
