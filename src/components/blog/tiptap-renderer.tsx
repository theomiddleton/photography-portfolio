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
      let isLoading = true
      const mainImage = gallery.querySelector(
        '.gallery-main-image',
      ) as HTMLImageElement
      const counter = gallery.querySelector('.gallery-counter')
      const thumbnailsContainer = gallery.querySelector('.gallery-thumbnails')
      const prevButton = gallery.querySelector('.gallery-prev')
      const nextButton = gallery.querySelector('.gallery-next')

      // Create circular indices function (same as in node view)
      const createCircularIndices = (currentIndex: number, total: number) => {
        const indices = []
        const displayCount = 7
        const center = Math.floor(displayCount / 2)
        
        for (let i = 0; i < displayCount; i++) {
          let index = currentIndex - center + i
          while (index < 0) index += total
          while (index >= total) index -= total
          indices.push(index)
        }
        
        return indices
      }

      const updateGallery = (index: number) => {
        currentIndex = index
        isLoading = true
        
        if (mainImage) {
          // Add fade effect for smoother transitions
          mainImage.style.opacity = '0'
          setTimeout(() => {
            mainImage.src = sources[index]
            mainImage.alt = `Gallery image ${index + 1}`
            mainImage.style.opacity = '1'
            isLoading = false
          }, 150)
        }
        
        if (counter) {
          counter.textContent = `${index + 1} / ${sources.length}`
        }

        // Update thumbnails display
        updateThumbnails()
      }

      const updateThumbnails = () => {
        if (!thumbnailsContainer) return
        
        const visibleIndices = createCircularIndices(currentIndex, sources.length)
        
        // Clear existing thumbnails
        thumbnailsContainer.innerHTML = ''
        
        // Create new thumbnails
        visibleIndices.forEach((index, i) => {
          const isCenter = i === Math.floor(visibleIndices.length / 2)
          const thumbnailWrapper = document.createElement('div')
          thumbnailWrapper.className = `relative mx-1 flex-none p-2 ${isCenter ? 'z-20' : 'z-0'}`
          thumbnailWrapper.style.transform = isCenter ? 'none' : 'scale(0.9)'
          thumbnailWrapper.style.opacity = isCenter ? '1' : '0.6'
          
          const thumbnailButton = document.createElement('button')
          thumbnailButton.className = `relative block h-20 w-32 overflow-hidden rounded-lg transition-all duration-300 ${
            isCenter ? 'outline outline-2 outline-black outline-offset-4' : ''
          }`
          thumbnailButton.setAttribute('aria-label', `View Gallery image ${index + 1}`)
          thumbnailButton.setAttribute('aria-current', index === currentIndex ? 'true' : 'false')
          
          const thumbnailImg = document.createElement('img')
          thumbnailImg.src = sources[index]
          thumbnailImg.alt = `Gallery image ${index + 1}`
          thumbnailImg.className = 'w-full h-full object-cover'
          thumbnailImg.loading = 'lazy'
          
          thumbnailButton.appendChild(thumbnailImg)
          thumbnailWrapper.appendChild(thumbnailButton)
          thumbnailsContainer.appendChild(thumbnailWrapper)
          
          // Add click handler
          thumbnailButton.addEventListener('click', () => {
            updateGallery(index)
          })
        })
      }

      const handlePrevious = () => {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : sources.length - 1
        updateGallery(newIndex)
      }

      const handleNext = () => {
        const newIndex = currentIndex < sources.length - 1 ? currentIndex + 1 : 0
        updateGallery(newIndex)
      }

      // Add navigation button handlers
      if (prevButton) {
        prevButton.addEventListener('click', handlePrevious)
      }

      if (nextButton) {
        nextButton.addEventListener('click', handleNext)
      }

      // Add keyboard navigation
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
          handlePrevious()
        } else if (event.key === 'ArrowRight') {
          handleNext()
        }
      }

      window.addEventListener('keydown', handleKeyDown)

      // Initialize the gallery
      setTimeout(() => updateGallery(0), 100)

      // Cleanup function for this gallery
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    })
  }, [output]) // Re-run when HTML output changes

  return (
    <div
      ref={containerRef}
      className="tiptap-content prose prose-gray max-w-none dark:prose-invert
        prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
        prose-p:text-base prose-p:leading-7 prose-p:text-gray-700 prose-img:rounded-lg
        prose-img:shadow-md dark:prose-p:text-gray-300"
      dangerouslySetInnerHTML={{ __html: output }}
    />
  )
}
