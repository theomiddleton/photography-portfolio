'use server'

import sharp from 'sharp'
import type { ImageDataType } from '~/app/(admin)/admin/manage/page'
import {
  rgbToHsl,
  type RGBColour,
  type HSLColour,
} from '~/lib/colour/colour-utils'

type ImageWithColour = {
  id: number
  name: string
  order: number
  uuid: string
  fileName: string
  fileUrl: string
  description?: string
  tags: string
  visible: boolean
  uploadedAt: Date
  modifiedAt?: Date
  colour: HSLColour
}

async function getAverageColour(imageUrl: string): Promise<RGBColour> {
  try {
    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { dominant } = await sharp(buffer).stats()

    return {
      r: dominant.r,
      g: dominant.g,
      b: dominant.b,
    }
  } catch (error) {
    console.error('Error processing image:', error)
    return { r: 0, g: 0, b: 0 }
  }
}

export async function sortImagesByColour(images: ImageDataType[]) {
  console.log('Sorting images by colour...')
  // Process all images to get their colours
  const imagesWithColour: ImageWithColour[] = await Promise.all(
    images.map(async (image) => {
      const rgbColour = await getAverageColour(image.fileUrl)
      console.log('Image proccessed ', image.id, rgbColour)
      const hslColour = rgbToHsl(rgbColour)
      console.log('Image processed:', image.id, hslColour)
      return { ...image, colour: hslColour }
    }),
  )
  console.log('Images processed:', imagesWithColour.length)

  // Sort images by hue, then saturation, then lightness
  const sortedImages = imagesWithColour.sort((a, b) => {
    // Primary sort by hue
    if (Math.abs(a.colour.h - b.colour.h) > 10) {
      return a.colour.h - b.colour.h
    }
    // Secondary sort by saturation
    if (Math.abs(a.colour.s - b.colour.s) > 10) {
      return b.colour.s - a.colour.s
    }
    // Tertiary sort by lightness
    return b.colour.l - a.colour.l
  })
  console.log('Images sorted', sortedImages.length)
  console.log('Sorted images:', sortedImages)

  console.log('Images sorted & returned', sortedImages.length)
  // Return sorted images with new order values
  return sortedImages.map((image, index) => ({
    id: image.id,
    name: image.name,
    order: index,
    uuid: image.uuid,
    fileName: image.fileName,
    fileUrl: image.fileUrl,
    description: image.description,
    tags: image.tags,
    visible: image.visible,
    uploadedAt: image.uploadedAt,
    modifiedAt: image.modifiedAt,
  }))
}
