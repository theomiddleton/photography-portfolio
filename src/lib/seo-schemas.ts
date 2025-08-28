import { siteConfig } from '~/config/site'

export function generatePhotographyFAQSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What types of photography does ${siteConfig.ownerName} specialize in?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${siteConfig.ownerName} specializes in professional portrait photography, landscape photography, and event photography. Each session is tailored to capture unique moments and create stunning visual stories.`
        }
      },
      {
        '@type': 'Question',
        name: 'How can I book a photography session?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can contact ${siteConfig.ownerName} through the contact form on this website or via the social media links provided. We'll discuss your photography needs and schedule a session that works for you.`
        }
      },
      {
        '@type': 'Question',
        name: 'Are photography prints available for purchase?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, high-quality photography prints are available through our online store. Each print is professionally produced using archival materials to ensure lasting quality for your home or office.'
        }
      },
      {
        '@type': 'Question',
        name: 'What should I expect during a photography session?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${siteConfig.ownerName} provides professional guidance throughout the session to ensure you feel comfortable and confident. We focus on capturing natural, authentic moments while maintaining the highest standards of professional photography.`
        }
      },
      {
        '@type': 'Question',
        name: 'How long does it take to receive photos after a session?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Edited photos are typically delivered within 1-2 weeks after the session. You\'ll receive high-resolution digital images that are professionally edited and ready for printing or sharing.'
        }
      }
    ]
  }
}

export function generateLocalBusinessSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}#business`,
    name: `${siteConfig.ownerName} Photography`,
    description: siteConfig.description,
    url: baseUrl,
    telephone: 'Contact via website',
    email: siteConfig.emails.support,
    image: siteConfig.seo.openGraph.images[0]?.url,
    founder: {
      '@type': 'Person',
      name: siteConfig.ownerName,
      jobTitle: 'Professional Photographer'
    },
    serviceType: 'Photography Services',
    areaServed: {
      '@type': 'Country',
      name: 'United Kingdom'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Photography Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Portrait Photography',
            description: 'Professional portrait photography for individuals, couples, and families'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Event Photography',
            description: 'Professional photography for events, celebrations, and special occasions'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Landscape Photography',
            description: 'Artistic landscape and nature photography for personal and commercial use'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Photography Prints',
            description: 'High-quality prints of professional photographs available for purchase'
          }
        }
      ]
    },
    priceRange: '$$',
    sameAs: Object.values(siteConfig.links).filter(Boolean)
  }
}

export function generateOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: `${siteConfig.ownerName} Photography`,
    description: siteConfig.description,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: siteConfig.seo.openGraph.images[0]?.url,
      width: siteConfig.seo.openGraph.images[0]?.width,
      height: siteConfig.seo.openGraph.images[0]?.height
    },
    image: siteConfig.seo.openGraph.images[0]?.url,
    founder: {
      '@type': 'Person',
      name: siteConfig.ownerName,
      jobTitle: 'Professional Photographer'
    },
    knowsAbout: [
      'Photography',
      'Portrait Photography',
      'Landscape Photography',
      'Event Photography',
      'Photo Editing',
      'Visual Arts',
      'Digital Photography',
      'Commercial Photography'
    ],
    sameAs: Object.values(siteConfig.links).filter(Boolean)
  }
}