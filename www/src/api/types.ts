export interface ImageMeta {
  id: string
  name: string
  path: string
  thumb: string | null
  created_at: string
  updated_at: string
  tags: string[]
}

export interface ImageWithSimilarity extends ImageMeta {
  similarity: number
}

export interface ListResponse {
  page: number
  page_size: number
  count: number
  items: ImageMeta[]
}

export interface SimilarityListResponse {
  page: number
  page_size: number
  count: number
  items: ImageWithSimilarity[]
}

export interface UploadResponse {
  image_id: string
  path: string
}

export interface DeleteResponse {
  message: string
}

export interface ErrorResponse {
  detail: string
}
