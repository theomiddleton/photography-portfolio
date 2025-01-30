import { WoodenFrame } from '~/components/store/frame/wooden-frame'
import { ModernFrame } from '~/components/store/frame/modern-frame'

export type FrameStyle = 'classic' | 'modern' | 'floating' | 'walnut' | 'oak' | 'mahogany' | 'pine'

export type MatColor = 'white' | 'ivory' | 'black' | 'none'
export type FrameWidth = 'narrow' | 'medium' | 'wide'

interface FrameWrapperProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  frameStyle: FrameStyle
  matColor: MatColor
  frameWidth: FrameWidth
}

export function FrameWrapper(props: FrameWrapperProps) {
  // Determine if we should use wooden or modern frame
  const isWoodenFrame = ['walnut', 'oak', 'mahogany', 'pine'].includes(props.frameStyle)

  if (isWoodenFrame) {
    return <WoodenFrame {...props} woodType={props.frameStyle as 'walnut' | 'oak' | 'mahogany' | 'pine'} />
  }

  return <ModernFrame {...props} frameStyle={props.frameStyle as 'classic' | 'modern' | 'floating'} />
}

