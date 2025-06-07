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

        const visibleIndices = createCircularIndices(
          currentIndex,
          sources.length,
        )

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
          thumbnailButton.setAttribute(
            'aria-label',
            `View Gallery image ${index + 1}`,
          )
          thumbnailButton.setAttribute(
            'aria-current',
            index === currentIndex ? 'true' : 'false',
          )

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
        const newIndex =
          currentIndex > 0 ? currentIndex - 1 : sources.length - 1
        updateGallery(newIndex)
      }

      const handleNext = () => {
        const newIndex =
          currentIndex < sources.length - 1 ? currentIndex + 1 : 0
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

    // Add interactivity to image comparisons
    const comparisons = containerRef.current.querySelectorAll(
      '[data-type="image-comparison"]',
    )

    comparisons.forEach((comparison) => {
      const displayMode = comparison.getAttribute('data-display-mode')

      // Only add interactivity to interactive slider mode
      if (displayMode !== 'interactive') return

      const orientation =
        comparison.getAttribute('data-orientation') || 'horizontal'
      const container = comparison.querySelector(
        '.comparison-container',
      ) as HTMLElement
      const afterImage = comparison.querySelector(
        '.comparison-after-image',
      ) as HTMLElement
      const sliderLine = comparison.querySelector(
        '.comparison-slider-line',
      ) as HTMLElement
      const sliderHandle = comparison.querySelector(
        '.comparison-slider-handle',
      ) as HTMLElement

      if (!container || !afterImage || !sliderLine || !sliderHandle) return

      let isDragging = false
      let position = 50 // Initial position at 50%

      const updateSlider = (newPosition: number) => {
        position = Math.max(0, Math.min(100, newPosition))

        // Add transitions if not already present
        if (!afterImage.style.transition) {
          afterImage.style.transition = 'clip-path 0.1s ease'
        }
        if (!sliderLine.style.transition) {
          sliderLine.style.transition = 'all 0.1s ease'
        }
        if (!sliderHandle.style.transition) {
          sliderHandle.style.transition = 'all 0.1s ease'
        }

        if (orientation === 'horizontal') {
          // Horizontal slider
          afterImage.style.clipPath = `inset(0 ${100 - position}% 0 0)`
          sliderLine.style.left = `${position}%`
          sliderHandle.style.left = `${position}%`
        } else {
          // Vertical slider
          afterImage.style.clipPath = `inset(0 0 ${100 - position}% 0)`
          sliderLine.style.top = `${position}%`
          sliderHandle.style.top = `${position}%`
        }
      }

      const getPositionFromEvent = (event: MouseEvent | TouchEvent) => {
        const rect = container.getBoundingClientRect()

        let clientX: number
        let clientY: number

        if ('touches' in event) {
          clientX = event.touches[0].clientX
          clientY = event.touches[0].clientY
        } else {
          clientX = event.clientX
          clientY = event.clientY
        }

        if (orientation === 'horizontal') {
          return ((clientX - rect.left) / rect.width) * 100
        } else {
          return ((clientY - rect.top) / rect.height) * 100
        }
      }

      const handleStart = (event: MouseEvent | TouchEvent) => {
        isDragging = true
        event.preventDefault()

        const newPosition = getPositionFromEvent(event)
        updateSlider(newPosition)
      }

      const handleMove = (event: MouseEvent | TouchEvent) => {
        if (!isDragging) return

        event.preventDefault()
        const newPosition = getPositionFromEvent(event)
        updateSlider(newPosition)
      }

      const handleEnd = () => {
        isDragging = false
      }

      // Mouse events
      container.addEventListener('mousedown', handleStart)
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleEnd)

      // Touch events for mobile
      container.addEventListener('touchstart', handleStart, { passive: false })
      window.addEventListener('touchmove', handleMove, { passive: false })
      window.addEventListener('touchend', handleEnd)

      // Initialize slider position
      updateSlider(50)

      // Cleanup function for this comparison
      return () => {
        container.removeEventListener('mousedown', handleStart)
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleEnd)
        container.removeEventListener('touchstart', handleStart)
        window.removeEventListener('touchmove', handleMove)
        window.removeEventListener('touchend', handleEnd)
      }
    })

    // Add interactivity to image masonry
    const masonries = containerRef.current.querySelectorAll(
      '[data-type="image-masonry"]',
    )

    masonries.forEach((masonry) => {
      const images = JSON.parse(masonry.getAttribute('data-images') || '[]')
      if (images.length === 0) return

      // Add click handlers to all masonry images
      const masonryImages = masonry.querySelectorAll('.masonry-item img')
      
      masonryImages.forEach((img, index) => {
        const imgElement = img as HTMLImageElement
        
        // Add click handler for lightbox functionality
        imgElement.addEventListener('click', () => {
          openImageLightbox(images, index)
        })

        // Add keyboard support
        imgElement.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openImageLightbox(images, index)
          }
        })

        // Make images focusable for accessibility
        imgElement.setAttribute('tabindex', '0')
        imgElement.setAttribute('role', 'button')
        imgElement.setAttribute('aria-label', `View image ${index + 1} in lightbox`)
      })
    })

    // Lightbox functionality
    const openImageLightbox = (images: any[], startIndex: number) => {
      let currentIndex = startIndex
      
      // Create lightbox overlay
      const overlay = document.createElement('div')
      overlay.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4'
      overlay.style.transition = 'opacity 0.3s ease'
      
      // Create lightbox content container
      const lightboxContent = document.createElement('div')
      lightboxContent.className = 'relative max-w-full max-h-full flex items-center justify-center'
      
      // Create main image
      const lightboxImage = document.createElement('img')
      lightboxImage.className = 'max-w-full max-h-full object-contain'
      lightboxImage.style.transition = 'opacity 0.2s ease'
      
      // Create image counter
      const counter = document.createElement('div')
      counter.className = 'absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm'
      
      // Create caption
      const caption = document.createElement('div')
      caption.className = 'absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm text-center'
      caption.style.display = 'none'
      
      // Create close button
      const closeButton = document.createElement('button')
      closeButton.className = 'absolute top-4 right-4 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-75 transition-colors'
      closeButton.innerHTML = '×'
      closeButton.style.fontSize = '24px'
      closeButton.setAttribute('aria-label', 'Close lightbox')
      
      // Create navigation buttons
      const prevButton = document.createElement('button')
      prevButton.className = 'absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-opacity-75 transition-colors'
      prevButton.innerHTML = '‹'
      prevButton.style.fontSize = '24px'
      prevButton.setAttribute('aria-label', 'Previous image')
      prevButton.style.display = images.length > 1 ? 'flex' : 'none'
      
      const nextButton = document.createElement('button')
      nextButton.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-opacity-75 transition-colors'
      nextButton.innerHTML = '›'
      nextButton.style.fontSize = '24px'
      nextButton.setAttribute('aria-label', 'Next image')
      nextButton.style.display = images.length > 1 ? 'flex' : 'none'
      
      // Update lightbox content
      const updateLightbox = (index: number) => {
        const image = images[index]
        lightboxImage.style.opacity = '0'
        
        setTimeout(() => {
          lightboxImage.src = image.src
          lightboxImage.alt = image.alt || `Masonry image ${index + 1}`
          counter.textContent = `${index + 1} / ${images.length}`
          
          if (image.caption) {
            caption.textContent = image.caption
            caption.style.display = 'block'
          } else {
            caption.style.display = 'none'
          }
          
          lightboxImage.style.opacity = '1'
        }, 100)
      }
      
      // Navigation functions
      const showPrevious = () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
        updateLightbox(currentIndex)
      }
      
      const showNext = () => {
        currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
        updateLightbox(currentIndex)
      }
      
      const closeLightbox = () => {
        overlay.style.opacity = '0'
        setTimeout(() => {
          document.body.removeChild(overlay)
          document.body.style.overflow = ''
        }, 300)
      }
      
      // Event listeners
      closeButton.addEventListener('click', closeLightbox)
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeLightbox()
      })
      
      if (images.length > 1) {
        prevButton.addEventListener('click', showPrevious)
        nextButton.addEventListener('click', showNext)
      }
      
      // Keyboard navigation
      const handleKeydown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'Escape':
            closeLightbox()
            break
          case 'ArrowLeft':
            if (images.length > 1) showPrevious()
            break
          case 'ArrowRight':
            if (images.length > 1) showNext()
            break
        }
      }
      
      document.addEventListener('keydown', handleKeydown)
      
      // Cleanup function
      const cleanup = () => {
        document.removeEventListener('keydown', handleKeydown)
      }
      
      // Assemble lightbox
      lightboxContent.appendChild(lightboxImage)
      lightboxContent.appendChild(counter)
      lightboxContent.appendChild(caption)
      lightboxContent.appendChild(closeButton)
      if (images.length > 1) {
        lightboxContent.appendChild(prevButton)
        lightboxContent.appendChild(nextButton)
      }
      
      overlay.appendChild(lightboxContent)
      document.body.appendChild(overlay)
      document.body.style.overflow = 'hidden'
      
      // Initialize
      updateLightbox(currentIndex)
      
      // Add cleanup to overlay
      overlay.addEventListener('transitionend', () => {
        if (overlay.style.opacity === '0') {
          cleanup()
        }
      })
    }
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
