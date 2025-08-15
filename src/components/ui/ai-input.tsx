'use client'

import React from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '~/lib/utils'

interface AIInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  onAIClick: () => void
  loading?: boolean
  disabled?: boolean
  placeholder?: string
  multiline?: boolean
  className?: string
  showAIButton?: boolean
}

export function AIInput({
  label,
  value,
  onChange,
  onAIClick,
  loading = false,
  disabled = false,
  placeholder,
  multiline = false,
  className,
  showAIButton = true,
}: AIInputProps) {
  const InputComponent = multiline ? Textarea : Input

  return (
    <div className={cn('flex flex-col space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={label.toLowerCase()}>{label}</Label>
        {showAIButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAIClick}
            disabled={loading || disabled}
            className="h-8 px-2 text-xs"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            <span className="ml-1">AI</span>
          </Button>
        )}
      </div>
      <InputComponent
        id={label.toLowerCase()}
        placeholder={placeholder}
        value={value}
        onChange={(
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => onChange(e.target.value)}
        disabled={disabled}
        className={multiline ? 'min-h-[80px] resize-none' : ''}
      />
    </div>
  )
}
