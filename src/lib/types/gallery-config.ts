export type LayoutType = 'masonry' | 'grid' | 'list' | 'horizontal-masonry'
export type GridVariant = 'standard' | 'compact' | 'wide' | 'square'
export type GapSize = 'small' | 'medium' | 'large' | 'xl'
export type BorderRadius = 'none' | 'small' | 'medium' | 'large' | 'full'
export type AspectRatio = 'auto' | 'square' | 'portrait' | 'landscape' | 'golden'
export type HeroImagePosition = 'top' | 'center' | 'bottom'
export type HeroImageSize = 'small' | 'medium' | 'large' | 'xl' | 'full'
export type HeroImageStyle = 'featured' | 'banner' | 'showcase'
export type PriorityMode = 'order' | 'size' | 'views' | 'recent'
export type AnimationType = 'fade' | 'slide' | 'scale' | 'none'
export type HoverEffect = 'zoom' | 'overlay' | 'lift' | 'none'
export type BackgroundColor = 'default' | 'dark' | 'light' | 'custom'
export type OverlayColor = 'black' | 'white' | 'dark' | 'light'
export type ImageQuality = 'low' | 'medium' | 'high' | 'auto'

export interface MainGalleryConfig {
  id: number
  
  // Layout Configuration
  layout: LayoutType
  gridVariant: GridVariant | null
  
  // Column Configuration
  columnsMobile: number
  columnsTablet: number
  columnsDesktop: number
  columnsLarge: number
  
  // Spacing and Visual Configuration
  gapSize: GapSize
  borderRadius: BorderRadius | null
  aspectRatio: AspectRatio | null
  
  // Hero Image Configuration
  enableHeroImage: boolean
  heroImageId: number | null
  heroImagePosition: HeroImagePosition | null
  heroImageSize: HeroImageSize | null
  heroImageStyle: HeroImageStyle | null
  
  // Advanced Layout Options
  enableStaggered: boolean
  enablePrioritySort: boolean
  priorityMode: PriorityMode | null
  
  // Display Options
  showImageTitles: boolean
  showImageDescriptions: boolean
  showImageMetadata: boolean
  enableLightbox: boolean
  enableInfiniteScroll: boolean
  imagesPerPage: number
  
  // Animation and Transitions
  enableAnimations: boolean
  animationType: AnimationType | null
  hoverEffect: HoverEffect | null
  
  // Color and Theme
  backgroundColor: BackgroundColor | null
  overlayColor: OverlayColor | null
  overlayOpacity: number
  
  // Performance and Loading
  enableLazyLoading: boolean
  imageQuality: ImageQuality | null
  enableProgressiveLoading: boolean
  
  updatedAt: Date | null
  updatedBy: number | null
}

export interface ConfigSection {
  id: string
  title: string
  description: string
  icon: string
  fields: ConfigField[]
}

export interface ConfigField {
  key: keyof MainGalleryConfig
  label: string
  type: 'select' | 'toggle' | 'number' | 'range' | 'color'
  description?: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
  dependencies?: Partial<MainGalleryConfig>
}

export const DEFAULT_GALLERY_CONFIG: MainGalleryConfig = {
  id: 1,
  layout: 'masonry',
  gridVariant: 'standard',
  columnsMobile: 1,
  columnsTablet: 2,
  columnsDesktop: 3,
  columnsLarge: 4,
  gapSize: 'medium',
  borderRadius: 'medium',
  aspectRatio: 'auto',
  enableHeroImage: false,
  heroImageId: null,
  heroImagePosition: 'top',
  heroImageSize: 'large',
  heroImageStyle: 'featured',
  enableStaggered: false,
  enablePrioritySort: false,
  priorityMode: 'order',
  showImageTitles: true,
  showImageDescriptions: false,
  showImageMetadata: false,
  enableLightbox: true,
  enableInfiniteScroll: false,
  imagesPerPage: 50,
  enableAnimations: true,
  animationType: 'fade',
  hoverEffect: 'zoom',
  backgroundColor: 'default',
  overlayColor: 'black',
  overlayOpacity: 50,
  enableLazyLoading: true,
  imageQuality: 'auto',
  enableProgressiveLoading: true,
  updatedAt: null,
  updatedBy: null
}