import { redirect } from 'next/navigation'
import { checkTempLinkValidity, logGalleryAccess } from '~/lib/actions/gallery/access-control'
import { getGalleryById } from '~/lib/actions/gallery/gallery'

interface TempLinkPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function TempLinkPage({ params }: TempLinkPageProps) {
  const { token } = await params
  
  console.log('Temp link validation for token:', token)
  
  // Check the temporary link validity (don't increment usage yet)
  const validation = await checkTempLinkValidity(token)
  
  console.log('Validation result:', validation)
  
  if (!validation.isValid || !validation.galleryId) {
    console.log('Temp link validation failed - redirecting to error page')
    redirect('/g/temp/error')
  }

  // Get the gallery
  const gallery = await getGalleryById(validation.galleryId)
  
  if (!gallery) {
    console.log('Gallery not found - redirecting to error page')
    redirect('/g/temp/error')
  }

  console.log('Gallery found:', gallery.slug)

  // Log the access (but don't await it since we're about to redirect)
  logGalleryAccess(validation.galleryId, 'temp_link').catch(console.error)

  // Redirect to the gallery page with temp access token
  console.log('Redirecting to:', `/g/${gallery.slug}?temp_access=${token}`)
  redirect(`/g/${gallery.slug}?temp_access=${token}`)
}
