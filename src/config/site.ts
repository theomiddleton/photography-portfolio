export const siteConfig = {
  title: 'Portfolio',
  description: 'Photography portfolio of Theo Middleton',
  storeName: 'T Middleton Store',
  ownerName: 'Theo Middleton',
  imageBucketUrl: 'https://img.theomiddleton.me',
  blogBucketUrl: 'https://blog-img.theomiddleton.me',
  aboutBucketUrl: 'https://about-img.theomiddleton.me',
  customBucketUrl: 'https://custom-img.theomiddleton.me',
  streamBucketUrl: 'https://stream-files.theomiddleton.me',
  filesBucketUrl: 'https://files.theomiddleton.me',
  url: 'https://theoo.ooo',
  altUrl: 'https://theomiddleton.me',
  links: {
    github: '',
    website: 'https://theoo.ooo',
    instagram: 'https://www.instagram.com/theomiddleton_/',
    twitter: '',
    facebook: '',
  },
  headers: {
    main: '',
  },
  seo: {
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: 'Portfolio Project',
      images: [
        {
          url: 'https://files.theomiddleton.me/og-images/2-boats.jpg',
          width: 1200,
          height: 630,
          alt: 'Open Graph Image',
        },
      ],
    },
  },
  emails: {
    order: 'orders@email.theoo.ooo',
    support: 'support@theoo.ooo',
    replyTo: 'reply@theoo.ooo',
    noReply: 'noreply@email.theoo.ooo',
  },
  features: {
    aiEnabled: true,
    storeEnabled: true,
    reviewsEnabled: true,
  },
}
export type SiteConfig = typeof siteConfig
