import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype|woff)'\)/)

  if (resource) {
    const response = await fetch(resource[1])
    if (response.status == 200) {
      return await response.arrayBuffer()
    }
  }

  throw new Error('failed to load font data')
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const imageUrl = searchParams.get('image')
    const title = searchParams.get('title') ?? ''

    // Load the font with the actual text we'll display
    const fontData = await loadGoogleFont('Inter', title)

    if (!imageUrl) {
      return new ImageResponse(
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            background: 'white',
          }}
        >
          Please provide an image URL
        </div>,
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: 'Inter',
              data: fontData,
              style: 'normal',
              weight: 400,
            },
          ],
        },
      )
    }

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          position: 'relative',
          background: 'white',
          fontFamily: 'Inter',
        }}
      >
        {/* Background blurred image */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%',
          }}
        >
          <img
            src={imageUrl || '/placeholder.svg'}
            alt="Background"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(25px) brightness(1.1)',
              transform: 'scale(1.1)',
            }}
          />
        </div>

        {/* Content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'relative',
            // zIndex: 1,
          }}
        >
          <img
            src={imageUrl || '/placeholder.svg'}
            alt="Main image"
            style={{
              maxWidth: '80%',
              maxHeight: '70%',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            }}
          />

          {title && (
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: 'black',
                textAlign: 'center',
                padding: '40px',
                maxWidth: '90%',
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
          )}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
            weight: 400,
          },
        ],
      }
    )
  } catch (e) {
    console.error(e)
    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          background: 'white',
          fontFamily: 'Inter',
        }}
      >
        Failed to generate image
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: await loadGoogleFont('Inter', 'Failed to generate image'),
            style: 'normal',
            weight: 400,
          },
        ],
      }
    )
  }
}

