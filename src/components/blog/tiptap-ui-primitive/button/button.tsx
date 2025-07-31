import * as React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/blog/tiptap-ui-primitive/tooltip'

type PlatformShortcuts = Record<string, string>

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  showTooltip?: boolean
  tooltip?: React.ReactNode
  shortcutKeys?: string
}

export const MAC_SYMBOLS: PlatformShortcuts = {
  ctrl: '⌘',
  alt: '⌥',
  shift: '⇧',
} as const

export const formatShortcutKey = (key: string, isMac: boolean) => {
  if (isMac) {
    const lowerKey = key.toLowerCase()
    return MAC_SYMBOLS[lowerKey] || key.toUpperCase()
  }
  return key.charAt(0).toUpperCase() + key.slice(1)
}

export const parseShortcutKeys = (
  shortcutKeys: string | undefined,
  isMac: boolean
) => {
  if (!shortcutKeys) return []

  return shortcutKeys
    .split('-')
    .map((key) => key.trim())
    .map((key) => formatShortcutKey(key, isMac))
}

export const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) return null

  return (
    <div className="flex items-center gap-1">
      {shortcuts.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && <kbd className="mx-0.5">+</kbd>}
            <kbd className="min-w-5 px-1 py-0.5 text-xs font-sans font-medium bg-gray-100 border border-gray-200 rounded dark:bg-gray-800 dark:border-gray-700">
            {key}
            </kbd>
        </React.Fragment>
      ))}
    </div>
  )
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      children,
      tooltip,
      showTooltip = true,
      shortcutKeys,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const isMac = React.useMemo(
      () =>
        typeof navigator !== 'undefined' &&
        navigator.platform.toLowerCase().includes('mac'),
      []
    )

    const shortcuts = React.useMemo(
      () => parseShortcutKeys(shortcutKeys, isMac),
      [shortcutKeys, isMac]
    )
    const baseButtonClasses = `
      h-8 min-w-8 px-2 py-2 gap-1
      inline-flex items-center justify-center
      text-sm font-medium leading-none
      rounded-xl border-none
      transition-all duration-200
      disabled:bg-gray-50 disabled:text-gray-400
      dark:disabled:bg-gray-800 dark:disabled:text-gray-500
      focus:outline-hidden
      data-[highlighted=true]:bg-gray-100 data-[highlighted=true]:text-gray-900
      dark:data-[highlighted=true]:bg-gray-700 dark:data-[highlighted=true]:text-gray-100
      data-[size=large]:text-[0.9375rem] data-[size=large]:h-9.5 data-[size=large]:min-w-9.5 data-[size=large]:p-2.5
      data-[size=small]:text-xs data-[size=small]:h-6 data-[size=small]:min-w-6 data-[size=small]:p-1.5 data-[size=small]:rounded-lg
      data-[style=ghost]:bg-transparent data-[style=ghost]:hover:bg-gray-100
      dark:data-[style=ghost]:hover:bg-gray-800
      data-[style=primary]:bg-blue-500 data-[style=primary]:text-white data-[style=primary]:hover:bg-blue-600
      dark:data-[style=primary]:bg-blue-400 dark:data-[style=primary]:text-gray-900 dark:data-[style=primary]:hover:bg-blue-500
      data-[active-state=on]:bg-gray-200 data-[active-state=on]:text-gray-900
      dark:data-[active-state=on]:bg-gray-700 dark:data-[active-state=on]:text-gray-100
      data-[state=open]:bg-gray-200 data-[state=open]:text-gray-900
      dark:data-[state=open]:bg-gray-700 dark:data-[state=open]:text-gray-100
      ${className}
    `.trim()

    if (!tooltip || !showTooltip) {
      return (
        <button
          className={baseButtonClasses}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </button>
      )
    }

    return (
      <Tooltip delay={200}>
        <TooltipTrigger
          className={baseButtonClasses}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-1">
            <span>{tooltip}</span>
            <ShortcutDisplay shortcuts={shortcuts} />
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }
)

Button.displayName = 'Button'

export default Button
