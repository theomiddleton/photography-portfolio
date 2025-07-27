// import { imageData } from "~/server/db/schema"

// export type ImageData = typeof imageData.$inferSelect

export interface PortfolioImageData {
  id: number
  uuid: string
  fileName: string
  fileUrl: string
  name: string
  description?: string // Corresponds to z.string().optional() in imageSchema
  tags?: string // Corresponds to z.string().optional() in imageSchema
  visible: boolean
  order: number
  priority?: number // For priority-based sorting
  isHero?: boolean // Mark as hero image
  uploadedAt: Date
  modifiedAt: Date
}
