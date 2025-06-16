export interface GalleryTemplate {
  id: string
  name: string
  description: string
  preview: string
  layout: 'masonry' | 'grid' | 'square' | 'list'
  columns: {
    mobile: number
    tablet: number
    desktop: number
  }
  category: string
  tags: string[]
  settings: {
    showCaptions: boolean
    showMetadata: boolean
    allowDownloads: boolean
    lightboxEnabled: boolean
    autoplay?: boolean
    transitionSpeed?: number
  }
}

export const galleryTemplates: GalleryTemplate[] = [
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Professional portfolio layout with clean masonry design',
    preview: '/templates/portfolio.jpg',
    layout: 'masonry',
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 3
    },
    category: 'professional',
    tags: ['portfolio', 'professional', 'clean'],
    settings: {
      showCaptions: true,
      showMetadata: false,
      allowDownloads: false,
      lightboxEnabled: true
    }
  },
  {
    id: 'wedding',
    name: 'Wedding Gallery',
    description: 'Elegant layout perfect for wedding photography',
    preview: '/templates/wedding.jpg',
    layout: 'grid',
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 4
    },
    category: 'events',
    tags: ['wedding', 'elegant', 'romantic'],
    settings: {
      showCaptions: true,
      showMetadata: true,
      allowDownloads: true,
      lightboxEnabled: true,
      autoplay: true,
      transitionSpeed: 3000
    }
  },
  {
    id: 'landscape',
    name: 'Landscape Collection',
    description: 'Wide format showcase for landscape photography',
    preview: '/templates/landscape.jpg',
    layout: 'list',
    columns: {
      mobile: 1,
      tablet: 1,
      desktop: 1
    },
    category: 'nature',
    tags: ['landscape', 'nature', 'wide'],
    settings: {
      showCaptions: true,
      showMetadata: true,
      allowDownloads: false,
      lightboxEnabled: true
    }
  },
  {
    id: 'street',
    name: 'Street Photography',
    description: 'Dynamic grid layout for urban photography',
    preview: '/templates/street.jpg',
    layout: 'masonry',
    columns: {
      mobile: 2,
      tablet: 3,
      desktop: 4
    },
    category: 'urban',
    tags: ['street', 'urban', 'dynamic'],
    settings: {
      showCaptions: false,
      showMetadata: false,
      allowDownloads: false,
      lightboxEnabled: true
    }
  },
  {
    id: 'product',
    name: 'Product Showcase',
    description: 'Square grid perfect for product photography',
    preview: '/templates/product.jpg',
    layout: 'square',
    columns: {
      mobile: 2,
      tablet: 3,
      desktop: 4
    },
    category: 'commercial',
    tags: ['product', 'commercial', 'grid'],
    settings: {
      showCaptions: true,
      showMetadata: false,
      allowDownloads: false,
      lightboxEnabled: true
    }
  },
  {
    id: 'event',
    name: 'Event Gallery',
    description: 'Mixed layout for event documentation',
    preview: '/templates/event.jpg',
    layout: 'masonry',
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 3
    },
    category: 'events',
    tags: ['event', 'documentation', 'mixed'],
    settings: {
      showCaptions: true,
      showMetadata: true,
      allowDownloads: true,
      lightboxEnabled: true,
      autoplay: false
    }
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Start with a blank template and customize everything',
    preview: '/templates/custom.jpg',
    layout: 'masonry',
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 3
    },
    category: 'general',
    tags: ['custom', 'flexible'],
    settings: {
      showCaptions: true,
      showMetadata: false,
      allowDownloads: false,
      lightboxEnabled: true
    }
  }
]

export function getTemplateById(id: string): GalleryTemplate | undefined {
  return galleryTemplates.find(template => template.id === id)
}

export function getTemplatesByCategory(category: string): GalleryTemplate[] {
  return galleryTemplates.filter(template => template.category === category)
}

export function getAllCategories(): string[] {
  return [...new Set(galleryTemplates.map(template => template.category))]
}
