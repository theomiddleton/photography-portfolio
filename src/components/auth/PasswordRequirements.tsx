'use client'

import { Check, X } from 'lucide-react'

interface PasswordRequirementsProps {
  password: string
}

interface Requirement {
  label: string
  test: (password: string) => boolean
}

const requirements: Requirement[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8
  },
  {
    label: 'One uppercase letter (A-Z)',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: 'One lowercase letter (a-z)',
    test: (password) => /[a-z]/.test(password)
  },
  {
    label: 'One number (0-9)',
    test: (password) => /\d/.test(password)
  },
  {
    label: 'One special character (!@#$%^&*)',
    test: (password) => /[^A-Za-z0-9]/.test(password)
  }
]

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <div className="text-sm space-y-2">
      <div className="text-muted-foreground font-medium">Password requirements:</div>
      <div className="space-y-1">
        {requirements.map((requirement, index) => {
          const isValid = requirement.test(password)
          return (
            <div
              key={index}
              className={`flex items-center gap-2 transition-colors ${
                isValid ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              {isValid ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={isValid ? 'line-through' : ''}>{requirement.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}