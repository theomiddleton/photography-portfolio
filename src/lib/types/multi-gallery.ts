import type { 
  MultiGalleryPage, 
  MultiGallerySection, 
  MultiGallerySectionImage, 
  MultiGallerySeparator 
} from '~/server/db/schema'
import type { PortfolioImageData } from './image'

// Re-export database types
export type { MultiGalleryPage, MultiGallerySection, MultiGallerySectionImage, MultiGallerySeparator }

// Separator types
export type SeparatorType = 'divider' | 'text' | 'image' | 'spacer'

export interface SeparatorConfig {
  type: SeparatorType
  content?: string // Text content or image URL
  height?: number // Height in pixels for spacer
  style?: {
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderStyle?: 'solid' | 'dashed' | 'dotted'
    textAlign?: 'left' | 'center' | 'right'
    fontSize?: number
    fontWeight?: 'normal' | 'bold'
    color?: string
    padding?: number
    margin?: number
  }
}

// Section configuration - mirrors MainGalleryConfig but for individual sections
export interface MultiGallerySectionConfig {
  id?: string
  title?: string
  description?: string
  layout: 'masonry' | 'grid' | 'list' | 'horizontal-masonry'
  gridVariant?: 'standard' | 'compact' | 'wide' | 'square'
  
  // Column Configuration
  columnsMobile: number
  columnsTablet: number
  columnsDesktop: number
  columnsLarge: number
  
  // Spacing and Visual Configuration
  gapSize: 'small' | 'medium' | 'large' | 'xl'
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full'
  aspectRatio?: 'auto' | 'square' | 'portrait' | 'landscape' | 'golden'
  
  // Hero Image Configuration
  enableHeroImage: boolean
  heroImageId?: number
  heroImagePosition?: 'top' | 'center' | 'bottom'
  heroImageSize?: 'small' | 'medium' | 'large' | 'xl' | 'full'
  heroImageStyle?: 'featured' | 'banner' | 'showcase'
  
  // Display Options
  showImageTitles: boolean
  showImageDescriptions: boolean
  showImageMetadata: boolean
  enableLightbox: boolean
  enableInfiniteScroll: boolean
  imagesPerPage: number
  
  // Animation and Visual Effects
  enableAnimations: boolean
  animationType?: 'fade' | 'slide' | 'zoom' | 'none'
  hoverEffect?: 'zoom' | 'fade' | 'lift' | 'blur' | 'none'
  backgroundColor?: 'default' | 'white' | 'black' | 'gray' | 'transparent'
  overlayColor?: 'black' | 'white' | 'transparent'
  overlayOpacity: number
  
  // Performance Options
  enableLazyLoading: boolean
  imageQuality?: 'auto' | 'high' | 'medium' | 'low'
  enableProgressiveLoading: boolean
}

// Page configuration
export interface MultiGalleryPageConfig extends Omit<MultiGalleryPage, 'createdAt' | 'updatedAt'> {
  sections: MultiGallerySectionWithImages[]
  separators: MultiGallerySeparatorWithConfig[]
}

// Section with images
export interface MultiGallerySectionWithImages extends MultiGallerySection {
  images: MultiGallerySectionImageWithData[]
}

// Section image with full image data
export interface MultiGallerySectionImageWithData extends Omit<MultiGallerySectionImage, 'imageId'> {
  image: PortfolioImageData
}

// Separator with config
export interface MultiGallerySeparatorWithConfig extends MultiGallerySeparator {
  config: SeparatorConfig
}

// Default configurations
export const DEFAULT_SECTION_CONFIG: MultiGallerySectionConfig = {
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
  heroImagePosition: 'top',
  heroImageSize: 'large',
  heroImageStyle: 'featured',
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
  overlayOpacity: 20,
  enableLazyLoading: true,
  imageQuality: 'auto',
  enableProgressiveLoading: false,
}

export const DEFAULT_SEPARATOR_CONFIG: SeparatorConfig = {
  type: 'divider',
  height: 50,
  style: {
    backgroundColor: 'transparent',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 20,
    margin: 20,
  }
}

// Form data types for creating/editing
export interface CreateMultiGalleryPageRequest {
  slug: string
  title: string
  description?: string
  isPublic?: boolean
  showInNav?: boolean
  seoTitle?: string
  seoDescription?: string
}

export interface UpdateMultiGalleryPageRequest extends Partial<CreateMultiGalleryPageRequest> {
  id: string
}

export interface CreateMultiGallerySectionRequest {
  pageId: string
  order: number
  title?: string
  description?: string
  config: MultiGallerySectionConfig
  imageIds: number[]
}

export interface UpdateMultiGallerySectionRequest extends Partial<Omit<CreateMultiGallerySectionRequest, 'pageId'>> {
  id: string
}

export interface CreateMultiGallerySeparatorRequest {
  pageId: string
  position: number
  config: SeparatorConfig
}

export interface UpdateMultiGallerySeparatorRequest extends Partial<Omit<CreateMultiGallerySeparatorRequest, 'pageId'>> {
  id: string
}

// API Response types
export interface MultiGalleryPageResponse {
  success: boolean
  data?: MultiGalleryPageConfig
  error?: string
}

export interface MultiGalleryPageListResponse {
  success: boolean
  data?: MultiGalleryPage[]
  error?: string
}

export interface MultiGallerySectionResponse {
  success: boolean
  data?: MultiGallerySectionWithImages
  error?: string
}

export interface MultiGallerySeparatorResponse {
  success: boolean
  data?: MultiGallerySeparatorWithConfig
  error?: string
}