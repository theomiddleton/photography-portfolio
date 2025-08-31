import * as React from 'react'

type Orientation = 'horizontal' | 'vertical'

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation
  decorative?: boolean
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { decorative, orientation = 'vertical', className = '', ...divProps },
    ref
  ) => {
    const ariaOrientation = orientation === 'vertical' ? orientation : undefined
    const semanticProps = decorative
      ? { role: 'none' }
      : { 'aria-orientation': ariaOrientation, role: 'separator' }

    return (
      <div
        className={`
          shrink-0 bg-gray-200
          ${orientation === 'horizontal' ? 'h-px w-full' : 'h-6 w-px'}
          ${className}
        `.trim()}
        data-orientation={orientation}
        {...semanticProps}
        {...divProps}
        ref={ref}
      />
    )
  }
)

Separator.displayName = 'Separator'
