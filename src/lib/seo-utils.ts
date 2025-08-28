import { siteConfig } from '~/config/site'

interface TemplateVariables {
  ownerName?: string
  profession?: string
  specialties?: string
  businessType?: string
  description?: string
  title?: string
  postTitle?: string
  photoName?: string
  [key: string]: string | undefined
}

/**
 * Replace template variables in a string with actual values
 */
function replaceTemplateVariables(template: string, variables: TemplateVariables): string {
  let result = template
  
  // Replace each variable
  Object.entries(variables).forEach(([key, value]) => {
    if (value) {
      const regex = new RegExp(`{${key}}`, 'g')
      result = result.replace(regex, value)
    }
  })
  
  return result
}

/**
 * Get processed template variables from site config
 */
function getTemplateVariables(overrides: Partial<TemplateVariables> = {}): TemplateVariables {
  const specialties = siteConfig.seo.profession.specialties.join(', ')
  
  return {
    ownerName: siteConfig.ownerName,
    profession: siteConfig.seo.profession.title,
    specialties,
    businessType: siteConfig.seo.profession.businessType,
    description: siteConfig.description,
    ...overrides
  }
}

/**
 * Generate SEO metadata for different page types
 */
export const seoUtils = {
  /**
   * Generate homepage metadata
   */
  getHomepageMetadata() {
    const variables = getTemplateVariables()
    
    return {
      title: replaceTemplateVariables(siteConfig.seo.templates.title.main, variables),
      description: replaceTemplateVariables(siteConfig.seo.templates.description.portfolio, variables),
      keywords: this.getKeywords(['primary', 'secondary']),
      openGraph: {
        title: replaceTemplateVariables(siteConfig.seo.templates.title.main, variables),
        description: replaceTemplateVariables(siteConfig.seo.templates.description.portfolio, variables),
        url: siteConfig.url,
        siteName: replaceTemplateVariables(siteConfig.seo.openGraph.siteName, variables),
        images: siteConfig.seo.openGraph.images.map(img => ({
          ...img,
          alt: replaceTemplateVariables(img.alt, variables)
        })),
        type: 'website' as const,
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: replaceTemplateVariables(siteConfig.seo.templates.title.main, variables),
        description: replaceTemplateVariables(siteConfig.seo.templates.description.portfolio, variables),
        images: siteConfig.seo.openGraph.images.map(img => ({
          ...img,
          alt: replaceTemplateVariables(img.alt, variables)
        })),
      },
      alternates: {
        canonical: siteConfig.url,
      }
    }
  },

  /**
   * Generate about page metadata
   */
  getAboutMetadata(pageTitle?: string, contentDescription?: string) {
    const variables = getTemplateVariables({ 
      title: pageTitle 
    })
    
    const title = pageTitle 
      ? replaceTemplateVariables(siteConfig.seo.templates.title.aboutWithTitle, variables)
      : replaceTemplateVariables(siteConfig.seo.templates.title.about, variables)
    
    const description = contentDescription 
      || replaceTemplateVariables(siteConfig.seo.templates.description.aboutFallback, variables)

    return {
      title,
      description,
      keywords: this.getKeywords(['primary', 'bio']),
      openGraph: {
        title,
        description,
        url: `${siteConfig.url}/about`,
        siteName: replaceTemplateVariables(siteConfig.seo.openGraph.siteName, variables),
        images: siteConfig.seo.openGraph.images.map(img => ({
          ...img,
          alt: replaceTemplateVariables(img.alt, variables)
        })),
        type: 'profile' as const,
      },
      twitter: {
        card: 'summary_large_image' as const,
        title,
        description,
        images: siteConfig.seo.openGraph.images.map(img => ({
          ...img,
          alt: replaceTemplateVariables(img.alt, variables)
        })),
      },
      alternates: {
        canonical: `${siteConfig.url}/about`,
      }
    }
  },

  /**
   * Generate blog page metadata
   */
  getBlogMetadata() {
    const variables = getTemplateVariables()
    
    return {
      title: replaceTemplateVariables(siteConfig.seo.templates.title.blog, variables),
      description: replaceTemplateVariables(siteConfig.seo.templates.description.blog, variables),
      keywords: this.getKeywords(['primary', 'blog']),
      openGraph: {
        title: replaceTemplateVariables(siteConfig.seo.templates.title.blog, variables),
        description: replaceTemplateVariables(siteConfig.seo.templates.description.blogExplore, variables),
        url: `${siteConfig.url}/blog`,
        siteName: replaceTemplateVariables(siteConfig.seo.openGraph.siteName, variables),
        images: siteConfig.seo.openGraph.images.map(img => ({
          ...img,
          alt: replaceTemplateVariables(img.alt, variables)
        })),
        type: 'website' as const,
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: replaceTemplateVariables(siteConfig.seo.templates.title.blog, variables),
        description: replaceTemplateVariables(siteConfig.seo.templates.description.blogExplore, variables),
        images: siteConfig.seo.openGraph.images.map(img => ({
          ...img,
          alt: replaceTemplateVariables(img.alt, variables)
        })),
      },
      alternates: {
        canonical: `${siteConfig.url}/blog`,
      }
    }
  },

  /**
   * Generate blog post metadata
   */
  getBlogPostMetadata(postTitle: string, postDescription?: string, postSlug?: string) {
    const variables = getTemplateVariables({ 
      postTitle 
    })
    
    const title = replaceTemplateVariables(siteConfig.seo.templates.title.blogPost, variables)
    const description = postDescription 
      || replaceTemplateVariables(siteConfig.seo.templates.description.blogPost, variables)
    const url = postSlug ? `${siteConfig.url}/blog/${postSlug}` : siteConfig.url

    return {
      title,
      description,
      keywords: this.getKeywords(['primary', 'blog']),
      openGraph: {
        title,
        description,
        url,
        siteName: replaceTemplateVariables(siteConfig.seo.openGraph.siteName, variables),
        images: siteConfig.seo.openGraph.images.map(img => ({
          ...img,
          alt: replaceTemplateVariables(img.alt, variables)
        })),
        type: 'article' as const,
      },
      twitter: {
        card: 'summary_large_image' as const,
        title,
        description,
        images: siteConfig.seo.openGraph.images.map(img => ({
          ...img,
          alt: replaceTemplateVariables(img.alt, variables)
        })),
      },
      alternates: {
        canonical: url,
      }
    }
  },

  /**
   * Generate store page metadata
   */
  getStoreMetadata() {
    const variables = getTemplateVariables()
    
    return {
      title: replaceTemplateVariables(siteConfig.seo.templates.title.store, variables),
      description: replaceTemplateVariables(siteConfig.seo.templates.description.store, variables),
      keywords: this.getKeywords(['primary', 'store']),
      openGraph: {
        title: replaceTemplateVariables(siteConfig.seo.templates.title.store, variables),
        description: replaceTemplateVariables(siteConfig.seo.templates.description.store, variables),
        url: `${siteConfig.url}/store`,
        siteName: replaceTemplateVariables(siteConfig.seo.openGraph.siteName, variables),
        images: siteConfig.seo.openGraph.images.map(img => ({
          ...img,
          alt: replaceTemplateVariables(img.alt, variables)
        })),
        type: 'website' as const,
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: replaceTemplateVariables(siteConfig.seo.templates.title.store, variables),
        description: replaceTemplateVariables(siteConfig.seo.templates.description.store, variables),
        images: siteConfig.seo.openGraph.images.map(img => ({
          ...img,
          alt: replaceTemplateVariables(img.alt, variables)
        })),
      },
      alternates: {
        canonical: `${siteConfig.url}/store`,
      }
    }
  },

  /**
   * Generate photo page metadata
   */
  getPhotoMetadata(photoName: string, photoId: string, photoDescription?: string) {
    const variables = getTemplateVariables({ 
      photoName 
    })
    
    const title = replaceTemplateVariables(siteConfig.seo.templates.title.photo, variables)
    const description = photoDescription 
      || replaceTemplateVariables(siteConfig.seo.templates.description.photo, variables)

    return {
      title,
      description,
      keywords: this.getKeywords(['primary', 'photo']),
      openGraph: {
        title,
        description,
        url: `${siteConfig.url}/photo/${photoId}`,
        siteName: replaceTemplateVariables(siteConfig.seo.openGraph.siteName, variables),
        images: siteConfig.seo.openGraph.images.map(img => ({
          ...img,
          alt: replaceTemplateVariables(img.alt, variables)
        })),
        type: 'website' as const,
      },
      twitter: {
        card: 'summary_large_image' as const,
        title,
        description,
        images: siteConfig.seo.openGraph.images.map(img => ({
          ...img,
          alt: replaceTemplateVariables(img.alt, variables)
        })),
      },
      alternates: {
        canonical: `${siteConfig.url}/photo/${photoId}`,
      }
    }
  },

  /**
   * Get keywords for specific categories
   */
  getKeywords(categories: Array<keyof typeof siteConfig.seo.keywords>): string {
    const variables = getTemplateVariables()
    const keywords: string[] = []
    
    categories.forEach(category => {
      const categoryKeywords = siteConfig.seo.keywords[category]
      if (Array.isArray(categoryKeywords)) {
        keywords.push(...categoryKeywords.map(keyword => 
          replaceTemplateVariables(keyword, variables)
        ))
      }
    })
    
    return keywords.join(', ')
  },

  /**
   * Get structured data for person schema
   */
  getPersonSchema() {
    const variables = getTemplateVariables()
    const config = siteConfig.seo.structuredData.person
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${siteConfig.url}#person`,
      name: siteConfig.ownerName,
      jobTitle: replaceTemplateVariables(config.jobTitle, variables),
      description: replaceTemplateVariables(siteConfig.seo.templates.description.main, variables),
      url: siteConfig.url,
      image: siteConfig.seo.openGraph.images[0]?.url,
      knowsAbout: config.knowsAbout.map(skill => 
        replaceTemplateVariables(skill, variables)
      ),
      sameAs: Object.values(siteConfig.links).filter(Boolean)
    }
  },

  /**
   * Get structured data for business schema
   */
  getBusinessSchema() {
    const variables = getTemplateVariables()
    const config = siteConfig.seo.structuredData.business
    
    return {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': `${siteConfig.url}#business`,
      name: `${siteConfig.ownerName} Photography`,
      description: replaceTemplateVariables(config.description, variables),
      url: siteConfig.url,
      telephone: 'Contact via website',
      email: siteConfig.emails.support,
      image: siteConfig.seo.openGraph.images[0]?.url,
      founder: this.getPersonSchema(),
      serviceType: replaceTemplateVariables(config.serviceType, variables),
      areaServed: {
        '@type': 'Country',
        name: siteConfig.seo.profession.areaServed
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: replaceTemplateVariables(config.serviceType, variables),
        itemListElement: config.offers.map(offer => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: replaceTemplateVariables(offer.name, variables),
            description: replaceTemplateVariables(offer.description, variables)
          }
        }))
      },
      priceRange: siteConfig.seo.profession.priceRange,
      sameAs: Object.values(siteConfig.links).filter(Boolean)
    }
  }
}