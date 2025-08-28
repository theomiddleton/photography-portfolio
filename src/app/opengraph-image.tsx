import { ImageResponse } from 'next/og'
import { siteConfig } from '~/config/site'

export const runtime = 'edge'

export const alt = `${siteConfig.ownerName} Photography Portfolio`
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  const specialties = siteConfig.seo.profession.specialties
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' • ')
  
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />
        
        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              margin: '0 0 24px 0',
              letterSpacing: '-2px',
            }}
          >
            {siteConfig.ownerName}
          </h1>
          
          <p
            style={{
              fontSize: '32px',
              margin: '0 0 16px 0',
              opacity: 0.9,
              fontWeight: 300,
            }}
          >
            {siteConfig.seo.profession.title}
          </p>
          
          <p
            style={{
              fontSize: '24px',
              margin: '0 40px',
              opacity: 0.8,
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            {specialties} Photography
          </p>
        </div>
        
        {/* Bottom branding */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '18px',
            opacity: 0.7,
          }}
        >
          {siteConfig.url.replace('https://', '')}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}