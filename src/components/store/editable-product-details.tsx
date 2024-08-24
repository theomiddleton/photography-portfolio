'use client'

import { useState, useEffect } from 'react'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'

export function EditableField({ id, label, defaultValue }: { id: string, label: string, defaultValue: number }) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(event.target.value))
  }

  return (
    <div className="flex-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        className="w-full"
        value={value}
        onChange={handleChange}
      />
    </div>
  )
}
