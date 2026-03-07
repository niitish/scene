import { useCallback, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router'
import { useSWRConfig } from 'swr'
import { listKey, uploadImage } from '@/api/client'
import { NeoBadge } from '@/components/neo-badge'
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

  const { pendingCount, doneCount, isUploading } = items.reduce(
    (acc, i) => {
      if (i.status === 'uploading') acc.isUploading = true
      if (i.status === 'pending' || i.status === 'error') acc.pendingCount++
      if (i.status === 'done') acc.doneCount++
      return acc
    },
    { pendingCount: 0, doneCount: 0, isUploading: false }
  )

  return (
    <div>
      <div className="mb-8">
        <NeoBadge accent="bg-lime" rotate={1} className="mb-3">
          Add to Collection
        </NeoBadge>
        <h1 className="text-gray-800 text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter leading-none">
          Upload Images
        </h1>
      </div>

      <NeoCard
        variant="layered"
        accent={dragging ? 'bg-yellow' : 'bg-white'}
        offset={2.5}
        offsetAccent={dragging ? 'bg-cyan' : 'bg-gray-800'}
        className="mb-8"
        contentClassName={`p-10 sm:p-16 text-center cursor-pointer transition-all duration-75 ${
          !dragging
            ? 'hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px]'
            : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div
          className={`text-5xl mb-4 transition-transform duration-100 ${dragging ? 'scale-125' : ''}`}
        >
          📁
        </div>
        <p className="font-bold text-xl sm:text-2xl uppercase tracking-tight mb-1">
          {dragging ? 'Drop to add!' : 'Drop images here'}
        </p>
        <p className="font-bold text-gray-600 text-sm uppercase tracking-wide">
          or click to browse
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </NeoCard>

      {items.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-bold text-xl sm:text-2xl uppercase tracking-tight">
                {items.length} file{items.length !== 1 ? 's' : ''} queued
              </h2>
              {doneCount > 0 && (
                <p className="text-sm font-bold text-gray-600 mt-0.5">
                  {doneCount} of {items.length} uploaded
                </p>
              )}
            </div>
            <div className="flex gap-2 sm:gap-3">
              <NeoButton
                variant="lime"
                onClick={uploadAll}
                disabled={pendingCount === 0 || isUploading}
                className="flex-1 sm:flex-none"
              >
                Upload {pendingCount > 0 ? `(${pendingCount})` : 'All'}
              </NeoButton>
              <NeoButton
                variant="white"
                className="flex-1 sm:flex-none"
                disabled={isUploading}
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
              <NeoCard key={item.preview} accent="bg-white" className="overflow-hidden">
                <div className="relative border-b-2 border-gray-800" style={{ aspectRatio: '4/3' }}>
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${
                      item.status === 'uploading' ? 'bg-gray-800/50' : ''
                    } ${item.status === 'done' ? 'bg-lime/70' : ''} ${
                      item.status === 'error' ? 'bg-pink/70' : ''
                    }`}
                  >
                    {item.status === 'uploading' && (
                      <span className="text-white font-bold text-2xl animate-pulse">⏳</span>
                    )}
                    {item.status === 'done' && (
                      <span className="font-bold text-3xl text-gray-800">✓</span>
                    )}
                    {item.status === 'error' && (
                      <span className="font-bold text-3xl text-gray-800">✗</span>
                    )}
                  </div>
                  {item.status !== 'uploading' && item.status !== 'done' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeItem(idx)
                      }}
                      className="absolute top-1.5 right-1.5 bg-gray-800 text-white border-2 border-white w-6 h-6 flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-gray-700 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold truncate" title={item.file.name}>
                    {item.file.name}
                  </p>
                  {item.status === 'error' && (
                    <p className="text-xs text-red-700 font-bold mt-1 leading-tight">
                      {item.error}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 font-bold mt-0.5">
                    {(item.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </NeoCard>
            ))}
          </div>

          {items.every((i) => i.status === 'done') && (
            <NeoCard
              variant="layered"
              accent="bg-lime"
              offset={2.5}
              offsetAccent="bg-cyan"
              className="mt-12"
              contentClassName="py-10 px-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
            >
              <div>
                <p className="font-bold text-lg sm:text-xl uppercase tracking-tight">
                  All uploads complete!
                </p>
                <p className="text-sm font-bold text-gray-600 mt-0.5">
                  {items.length} image{items.length !== 1 ? 's' : ''} added to your gallery.
                </p>
              </div>
              <NeoButton variant="black" onClick={() => navigate('/gallery')}>
                View Gallery →
              </NeoButton>
            </NeoCard>
          )}
        </div>
      )}
    </div>
  )
}
