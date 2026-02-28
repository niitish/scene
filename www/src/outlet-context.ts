import type { ImageMeta } from '@/api/types'
import type { ToastType } from '@/components/toast'

export interface OutletContext {
  addToast: (msg: string, type?: ToastType) => void
  setPreview: (image: ImageMeta) => void
}
