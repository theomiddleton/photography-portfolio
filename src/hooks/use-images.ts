'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { toast } from 'sonner'
import type { ImageDataWithId } from '~/lib/actions/image'

interface UseImagesOptions {
  initialImages?: ImageDataWithId[]
  visibleOnly?: boolean
  sortBy?: string
  sortDirection?: "asc" | "desc"
  limit?: number
  refreshInterval?: number | null
}

export function useImages({
  initialImages = [],
  visibleOnly,
  sortBy = "order",
  sortDirection = "asc",
  limit,
  refreshInterval = 10000, // Default to 10 seconds, null to disable
}: UseImagesOptions = {}) {
  const [images, setImages] = useState<ImageDataWithId[]>(initialImages)
  const [isLoading, setIsLoading] = useState(initialImages.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Function to fetch images from the API
  const fetchImages = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true)
      }
      setError(null)

      try {
        // Build query parameters
        const params = new URLSearchParams()
        if (visibleOnly !== undefined) {
          params.append("visible", visibleOnly.toString())
        }
        params.append("sortBy", sortBy)
        params.append("sortDirection", sortDirection)
        if (limit !== undefined) {
          params.append("limit", limit.toString())
        }

        const response = await fetch(`/api/images/?${params.toString()}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch images")
        }

        const data = await response.json()

        // Update state in a non-blocking transition
        startTransition(() => {
          setImages(data.images)
        })
      } catch (err) {
        console.error("Error fetching images:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast(err instanceof Error ? err.message : "Failed to load images")
      } finally {
        if (showLoading) {
          setIsLoading(false)
        }
      }
    },
    [visibleOnly, sortBy, sortDirection, limit, toast],
  )

  // Initial fetch and polling setup
  useEffect(() => {
    // Skip initial fetch if we already have images
    if (initialImages.length === 0) {
      fetchImages()
    }

    // Set up polling if refreshInterval is provided
    let intervalId: NodeJS.Timeout | null = null

    if (refreshInterval) {
      intervalId = setInterval(() => {
        fetchImages(false) // Don't show loading state during refresh
      }, refreshInterval)
    }

    // Clean up interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [fetchImages, initialImages.length, refreshInterval])

  // Function to update image order with optimistic updates
  const updateImagesOrder = useCallback(
    async (updatedImages: ImageDataWithId[]) => {
      // Create a map of id -> order for the API request
      const orderUpdates = updatedImages.map((img, index) => ({
        id: img.id,
        order: index,
      }))

      // Optimistically update the UI
      setImages(updatedImages)

      try {
        const response = await fetch("/api/images", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderUpdates),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to update image order")
        }

        // Refresh images to ensure we have the latest data
        fetchImages(false)

        toast("Success: Image order updated successfully")
      } catch (err) {
        console.error("Error updating image order:", err)

        // Revert to previous state on error
        fetchImages()

        toast(err instanceof Error ? err.message : "Failed to update image order")
      }
    },
    [fetchImages, toast],
  )

  // Function to toggle image visibility with optimistic updates
  const toggleImageVisibility = useCallback(
    async (id: number) => {
      // Find the image to update
      const imageToUpdate = images.find((img) => img.id === id)

      if (!imageToUpdate) {
        toast("Error: Image not found")
        return
      }

      // Optimistically update the UI
      setImages((prevImages) => prevImages.map((img) => (img.id === id ? { ...img, visible: !img.visible } : img)))

      try {
        const response = await fetch(`/api/images/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ toggleVisibility: true }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to toggle image visibility")
        }

        // Refresh images to ensure we have the latest data
        fetchImages(false)

        toast(`Success: Image ${imageToUpdate.visible ? "hidden" : "shown"} successfully`)
      } catch (err) {
        console.error("Error toggling image visibility:", err)

        // Revert to previous state on error
        fetchImages()

        toast("Failed to update image visibility")
      }
    },
    [images, fetchImages, toast],
  )

  // Function to delete an image
  const deleteImage = useCallback(
    async (id: number) => {
      // Optimistically update the UI
      setImages((prevImages) => prevImages.filter((img) => img.id !== id))

      try {
        const response = await fetch(`/api/images/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to delete image")
        }

        toast("Success: Image deleted successfully")
      } catch (err) {
        console.error("Error deleting image:", err)

        // Revert to previous state on error
        fetchImages()

        toast(err instanceof Error ? err.message : "Failed to delete image")
      }
    },
    [fetchImages, toast],
  )

  // Function to update image metadata
  const updateImage = useCallback(
    async (id: number, data: Partial<ImageDataWithId>) => {
      // Optimistically update the UI
      setImages((prevImages) => prevImages.map((img) => (img.id === id ? { ...img, ...data } : img)))

      try {
        const response = await fetch(`/api/images/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to update image")
        }

        // Refresh images to ensure we have the latest data
        fetchImages(false)

        toast("Success: Image updated successfully")
      } catch (err) {
        console.error("Error updating image:", err)

        // Revert to previous state on error
        fetchImages()

        toast(err instanceof Error ? err.message : "Failed to update image")
      }
    },
    [fetchImages, toast],
  )

  return {
    images,
    isLoading: isLoading || isPending,
    error,
    refresh: fetchImages,
    updateImagesOrder,
    toggleImageVisibility,
    deleteImage,
    updateImage,
  }
}
