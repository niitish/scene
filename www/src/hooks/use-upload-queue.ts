import { useCallback, useRef, useState } from 'react'
import { listKey, uploadImage } from '@/api/client'

export interface UploadItem {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

interface UseUploadQueueOptions {
  addToast: (message: string, type: 'success' | 'error') => void
  mutate: (key: string) => Promise<void>
}

export function useUploadQueue({ addToast, mutate }: UseUploadQueueOptions) {
  const [items, setItems] = useState<UploadItem[]>([])
  const uploadInProgressRef = useRef(false)
  const abortedRef = useRef(false)

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (!arr.length) {
        addToast('Only image files are accepted', 'error')
        return
      }
      setItems((prev) => [
        ...prev,
        ...arr.map((f) => ({
          id: crypto.randomUUID(),
          file: f,
          preview: URL.createObjectURL(f),
          status: 'pending' as const,
        })),
      ])
    },
    [addToast]
  )

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) {
        URL.revokeObjectURL(item.preview)
      }
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  const uploadAll = useCallback(async () => {
    if (uploadInProgressRef.current) return

    const pending = items.filter((i) => i.status === 'pending' || i.status === 'error')
    if (!pending.length) return

    uploadInProgressRef.current = true
    abortedRef.current = false
    let succeeded = 0
    let failed = 0

    try {
      for (const item of pending) {
        if (abortedRef.current) break

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'uploading' as const, error: undefined } : i
          )
        )
        try {
          await uploadImage(item.file)
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'done' as const } : i))
          )
          succeeded++
        } catch (e: unknown) {
          const msg = (e as Error).message ?? 'Upload failed'
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'error' as const, error: msg } : i))
          )
          failed++
        }
      }

      if (!abortedRef.current) {
        await mutate(listKey(1, 20))
        if (failed === 0) {
          addToast('Upload complete!', 'success')
        } else if (succeeded === 0) {
          addToast('All uploads failed', 'error')
        } else {
          addToast(`${succeeded} of ${succeeded + failed} uploaded. ${failed} failed.`, 'error')
        }
      }
    } finally {
      uploadInProgressRef.current = false
    }
  }, [items, mutate, addToast])

  const clearAll = useCallback(() => {
    abortedRef.current = true
    setItems((prev) => {
      prev.forEach((i) => URL.revokeObjectURL(i.preview))
      return []
    })
  }, [])

  const { pendingCount, doneCount, isUploading } = items.reduce(
    (acc, i) => {
      if (i.status === 'uploading') acc.isUploading = true
      if (i.status === 'pending' || i.status === 'error') acc.pendingCount++
      if (i.status === 'done') acc.doneCount++
      return acc
    },
    { pendingCount: 0, doneCount: 0, isUploading: false }
  )

  return {
    items,
    addFiles,
    removeItem,
    uploadAll,
    clearAll,
    pendingCount,
    doneCount,
    isUploading,
  }
}
