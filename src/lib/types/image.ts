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
  uploadedAt: Date
  modifiedAt: Date
}
