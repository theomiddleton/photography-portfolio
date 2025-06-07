'use client'

import { useMemo, useEffect, useRef } from 'react'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { ImageGalleryExtension } from '~/components/blog/tiptap-extension/image-gallery-extension'
import { HLSVideoExtension } from '~/components/blog/tiptap-extension/hls-video-extension'
import { ImageMasonryStaticExtension } from '~/components/blog/tiptap-extension/image-masonry-static-extension'
import { ImageComparisonStaticExtension } from '~/components/blog/tiptap-extension/image-comparison-static-extension'
import { ImageMasonryExtension } from '~/components/blog/tiptap-extension/image-masonry-extension'
import { ImageComparisonExtension } from '~/components/blog/tiptap-extension/image-comparison-extension'

interface TipTapRendererProps {
  content: any
}

export function TipTapRenderer({ content }: TipTapRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate HTML from TipTap JSON
  const output = useMemo(() => {
    if (!content) return '<p>No content available</p>'

    try {
      return generateHTML(content, [
        StarterKit,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Underline,
        TaskList.configure({
          HTMLAttributes: {
            class: 'not-prose pl-0',
          },
        }),
        TaskItem.configure({
          nested: true,
          HTMLAttributes: {
            class:
              'flex items-start gap-2 my-2 text-base text-gray-900 [&:has(input:checked)]:text-gray-500 [&:has(input:checked)]:line-through',
          },
        }),
        Highlight.configure({ multicolor: true }),
        Image,
        Typography,
        Superscript,
        Subscript,
        Placeholder,
        ImageGalleryExtension,
        HLSVideoExtension,
        // ImageMasonryStaticExtension,
        // ImageComparisonStaticExtension,
        ImageMasonryExtension,
        ImageComparisonExtension,
        Link.configure({ openOnClick: false }),
      ])
    } catch (error) {
      console.error('Error rendering TipTap content:', error)
      return '<p>Error rendering content</p>'
    }
  }, [content])

  // Add interactivity to image galleries after HTML is rendered
  useEffect(() => {
    if (!containerRef.current) return

    const galleries = containerRef.current.querySelectorAll(
      '[data-type="image-gallery"]',
    )

    galleries.forEach((gallery) => {
      const sources = JSON.parse(gallery.getAttribute('data-sources') || '[]')
      if (sources.length === 0) return

      let currentIndex = 0
      const mainImage = gallery.querySelector(
        '.gallery-main-image',
      ) as HTMLImageElement
      const counter = gallery.querySelector('.gallery-counter')
      const thumbnails = gallery.querySelectorAll('.gallery-thumbnail')
      const prevButton = gallery.querySelector('.gallery-prev')
      const nextButton = gallery.querySelector('.gallery-next')

      const updateGallery = (index: number) => {
        currentIndex = index
        if (mainImage) {
          // Add fade effect for smoother transitions
          mainImage.style.opacity = '0.5'
          setTimeout(() => {
            mainImage.src = sources[index]
            mainImage.alt = `Gallery image ${index + 1}`
            mainImage.style.opacity = '1'
          }, 150)
        }
        if (counter) {
          counter.textContent = `${index + 1} / ${sources.length}`
        }

        // Position the carousel so the selected image is under the center selector
        const thumbnailTrack = gallery.querySelector('.thumbnail-track') as HTMLElement
        const thumbnailViewport = gallery.querySelector('.thumbnail-viewport') as HTMLElement
        
        if (thumbnailTrack && thumbnailViewport && thumbnails.length > 0) {
          const thumbnailWidth = 64 + 12 // w-16 (64px) + gap (12px)
          const viewportWidth = thumbnailViewport.offsetWidth
          
          // Start from the middle set of thumbnails (sources.length offset)
          const adjustedIndex = index + sources.length
          
          // Calculate position to center the selected thumbnail under the fixed selector
          const centerOffset = viewportWidth / 2 - thumbnailWidth / 2
          const targetPosition = (adjustedIndex * thumbnailWidth) - centerOffset
          
          // Apply smooth transform
          thumbnailTrack.style.transform = `translateX(-${targetPosition}px)`
          
          // Update thumbnail highlighting - make the one under the selector brighter
          thumbnails.forEach((thumb, i) => {
            const originalIndex = parseInt(thumb.getAttribute('data-original-index') || '0')
            if (originalIndex === index) {
              thumb.classList.add('brightness-100', 'scale-105')
              thumb.classList.remove('brightness-75')
            } else {
              thumb.classList.add('brightness-75')
              thumb.classList.remove('brightness-100', 'scale-105')
            }
          })
        }
      }

      // Add click handlers for thumbnails (including duplicates)
      thumbnails.forEach((thumb) => {
        thumb.addEventListener('click', () => {
          const originalIndex = parseInt(thumb.getAttribute('data-original-index') || '0')
          updateGallery(originalIndex)
        })
      })

      // Add navigation button handlers
      if (prevButton) {
        prevButton.addEventListener('click', () => {
          const newIndex =
            currentIndex > 0 ? currentIndex - 1 : sources.length - 1
          updateGallery(newIndex)
        })
      }

      if (nextButton) {
        nextButton.addEventListener('click', () => {
          const newIndex =
            currentIndex < sources.length - 1 ? currentIndex + 1 : 0
          updateGallery(newIndex)
        })
      }

      // Add keyboard navigation
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
          const newIndex =
            currentIndex > 0 ? currentIndex - 1 : sources.length - 1
          updateGallery(newIndex)
        } else if (event.key === 'ArrowRight') {
          const newIndex =
            currentIndex < sources.length - 1 ? currentIndex + 1 : 0
          updateGallery(newIndex)
        }
      }

      window.addEventListener('keydown', handleKeyDown)

      // Initialize the gallery with circular carousel setup
      const thumbnailViewport = gallery.querySelector('.thumbnail-viewport') as HTMLElement
      
      if (thumbnailViewport && thumbnails.length > 0) {
        // Set fixed viewport width to show about 5 thumbnails
        const thumbnailWidth = 64 + 12 // w-16 (64px) + gap (12px)  
        const viewportWidth = 5 * thumbnailWidth - 12 // show 5 thumbnails, subtract last gap
        
        thumbnailViewport.style.width = `${viewportWidth}px`
        
        // Start all thumbnails dimmed except the selected one
        thumbnails.forEach((thumb) => {
          thumb.classList.add('brightness-75')
        })
        
        // Set initial position
        setTimeout(() => updateGallery(0), 100)
      }

      // Cleanup function for this gallery
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    })
  }, [output]) // Re-run when HTML output changes

  // Process the HTML to replace img tags with Next.js Image components
  // This would require a more complex solution
  // For now, we'll use dangerouslySetInnerHTML with some basic styling

  return (
    <div
      ref={containerRef}
      className="tiptap-content prose prose-gray max-w-none dark:prose-invert
        prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
        prose-p:text-base prose-p:leading-7 prose-p:text-gray-700 prose-img:rounded-lg
        prose-img:shadow-md dark:prose-p:text-gray-300
        [&_.image-gallery-container_.gallery-main-image]:transition-opacity
        [&_.image-gallery-container_.gallery-main-image]:duration-300
        [&_.image-gallery-container_.gallery-next:hover]:scale-110
        [&_.image-gallery-container_.gallery-next:hover]:shadow-md
        [&_.image-gallery-container_.gallery-next]:cursor-pointer
        [&_.image-gallery-container_.gallery-next]:transition-all
        [&_.image-gallery-container_.gallery-next]:duration-200
        [&_.image-gallery-container_.gallery-prev:hover]:scale-110
        [&_.image-gallery-container_.gallery-prev:hover]:shadow-md
        [&_.image-gallery-container_.gallery-prev]:cursor-pointer
        [&_.image-gallery-container_.gallery-prev]:transition-all
        [&_.image-gallery-container_.gallery-prev]:duration-200
        [&_.image-gallery-container_.gallery-thumbnail:hover]:scale-105
        [&_.image-gallery-container_.gallery-thumbnail:hover]:shadow-lg
        [&_.image-gallery-container_.gallery-thumbnail]:cursor-pointer
        [&_.image-gallery-container_.gallery-thumbnail]:transition-all
        [&_.image-gallery-container_.gallery-thumbnail]:duration-300"
      dangerouslySetInnerHTML={{ __html: output }}
    />
  )
}
