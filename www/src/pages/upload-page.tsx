import { useCallback, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router'
import { useSWRConfig } from 'swr'
import { listKey, uploadImage } from '@/api/client'
import { NeoButton } from '@/components/neo-button'
import { NeoCard } from '@/components/neo-card'
import type { OutletContext } from '@/outlet-context'

interface UploadItem {
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

export function UploadPage() {
  const { addToast } = useOutletContext<OutletContext>()
  const navigate = useNavigate()
  const [items, setItems] = useState<UploadItem[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate } = useSWRConfig()

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
          file: f,
          preview: URL.createObjectURL(f),
          status: 'pending' as const,
        })),
      ])
    },
    [addToast]
  )

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  function removeItem(idx: number) {
    setItems((prev) => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  async function uploadAll() {
    const pending = items.filter((i) => i.status === 'pending' || i.status === 'error')
    if (!pending.length) return

    for (const item of pending) {
      setItems((prev) =>
        prev.map((i) => (i.file === item.file ? { ...i, status: 'uploading' } : i))
      )
      try {
        await uploadImage(item.file)
        setItems((prev) => prev.map((i) => (i.file === item.file ? { ...i, status: 'done' } : i)))
      } catch (e: unknown) {
        const msg = (e as Error).message ?? 'Upload failed'
        setItems((prev) =>
          prev.map((i) => (i.file === item.file ? { ...i, status: 'error', error: msg } : i))
        )
      }
    }

    await mutate(listKey(1, 20))
    addToast('Upload complete!', 'success')
  }

  const pendingCount = items.filter((i) => i.status === 'pending' || i.status === 'error').length

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight mb-6">
        Upload Images
      </h1>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed border-black/60 p-8 sm:p-12 text-center cursor-pointer transition-colors duration-100 ${
          dragging ? 'bg-yellow' : 'bg-white hover:bg-yellow/30'
        }`}
      >
        <p className="text-4xl mb-3">📁</p>
        <p className="font-semibold text-lg sm:text-xl uppercase">Drop images here</p>
        <p className="font-bold text-gray-500 mt-1 text-sm">or tap to browse</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold text-lg sm:text-xl uppercase">
              {items.length} file{items.length !== 1 ? 's' : ''} queued
            </h2>
            <div className="flex gap-2 sm:gap-3">
              <NeoButton
                variant="lime"
                onClick={uploadAll}
                disabled={pendingCount === 0}
                className="flex-1 sm:flex-none"
              >
                Upload {pendingCount > 0 ? `(${pendingCount})` : 'All'}
              </NeoButton>
              <NeoButton
                variant="white"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  items.forEach((i) => URL.revokeObjectURL(i.preview))
                  setItems([])
                }}
              >
                Clear All
              </NeoButton>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {items.map((item, idx) => (
              <NeoCard key={item.preview} className="overflow-hidden">
                <div className="relative border-b-2 border-black" style={{ aspectRatio: '4/3' }}>
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${
                      item.status === 'uploading' ? 'bg-black/40' : ''
                    } ${item.status === 'done' ? 'bg-lime/60' : ''} ${
                      item.status === 'error' ? 'bg-pink/60' : ''
                    }`}
                  >
                    {item.status === 'uploading' && (
                      <span className="text-white font-semibold text-lg">⏳</span>
                    )}
                    {item.status === 'done' && <span className="font-semibold text-2xl">✓</span>}
                    {item.status === 'error' && <span className="font-semibold text-2xl">✗</span>}
                  </div>
                  {item.status !== 'uploading' && item.status !== 'done' && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="absolute top-1 right-1 bg-black text-white border border-white w-6 h-6 flex items-center justify-center font-semibold text-xs cursor-pointer hover:bg-gray-800"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-bold truncate" title={item.file.name}>
                    {item.file.name}
                  </p>
                  {item.status === 'error' && (
                    <p className="text-xs text-red-700 font-bold mt-1">{item.error}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(item.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </NeoCard>
            ))}
          </div>

          {items.every((i) => i.status === 'done') && (
            <div className="mt-6 border border-black shadow-[4px_4px_0px_#1a1a1a] bg-lime/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
              <p className="font-bold text-base sm:text-lg uppercase">All uploads complete!</p>
              <NeoButton variant="black" onClick={() => navigate('/gallery')}>
                View Gallery →
              </NeoButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
