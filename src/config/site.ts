export const siteConfig = {
  //title: 'Portfolio Project',
  title: 'Portfolio',
  description: 'Photography portfolio of Theo Middleton',
  storeName: 'T Middleton Store',
  imageBucketUrl: 'https://img.theomiddleton.me',
  blogBucketUrl: 'https://blog-img.theomiddleton.me',
  aboutBucketUrl: 'https://about-img.theomiddleton.me',
  customBucketUrl: 'https://custom-img.theomiddleton.me',
  url: 'https://theomiddleton.me',
  links: {
    github: 'https://github.com/theomiddleton/portfolio-project',
    website: 'https://theomiddleton.me'
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
    support: 'support@emails.theoo.ooo'
  }
}


export type SiteConfig = typeof siteConfig