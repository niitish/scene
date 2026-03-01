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
  const doneCount = items.filter((i) => i.status === 'done').length

  return (
    <div>
      <div className="mb-8">
        <div className="inline-block border-2 border-black bg-lime font-extrabold text-xs uppercase tracking-widest px-3 py-1 mb-3 shadow-[2px_2px_0px_#1a1a1a] rotate-1">
          Add to Collection
        </div>
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
          Upload Images
        </h1>
      </div>

      <div className="relative mb-8">
        <div
          className={`absolute inset-0 translate-x-2.5 translate-y-2.5 border-2 border-black transition-colors duration-100 ${dragging ? 'bg-yellow' : 'bg-black'}`}
        />
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-black p-10 sm:p-16 text-center cursor-pointer transition-all duration-75 ${
            dragging ? 'bg-yellow' : 'bg-white'
          } ${!dragging ? 'hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px]' : ''}`}
        >
          <div
            className={`text-5xl mb-4 transition-transform duration-100 ${dragging ? 'scale-125' : ''}`}
          >
            📁
          </div>
          <p className="font-extrabold text-xl sm:text-2xl uppercase tracking-tight mb-1">
            {dragging ? 'Drop to add!' : 'Drop images here'}
          </p>
          <p className="font-bold text-black/50 text-sm uppercase tracking-widest">
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
        </div>
      </div>

      {items.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-extrabold text-xl sm:text-2xl uppercase tracking-tight">
                {items.length} file{items.length !== 1 ? 's' : ''} queued
              </h2>
              {doneCount > 0 && (
                <p className="text-sm font-bold text-black/50 mt-0.5">
                  {doneCount} of {items.length} uploaded
                </p>
              )}
            </div>
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
                      item.status === 'uploading' ? 'bg-black/50' : ''
                    } ${item.status === 'done' ? 'bg-lime/70' : ''} ${
                      item.status === 'error' ? 'bg-pink/70' : ''
                    }`}
                  >
                    {item.status === 'uploading' && (
                      <span className="text-white font-extrabold text-2xl animate-pulse">⏳</span>
                    )}
                    {item.status === 'done' && (
                      <span className="font-extrabold text-3xl text-black">✓</span>
                    )}
                    {item.status === 'error' && (
                      <span className="font-extrabold text-3xl text-black">✗</span>
                    )}
                  </div>
                  {item.status !== 'uploading' && item.status !== 'done' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeItem(idx)
                      }}
                      className="absolute top-1.5 right-1.5 bg-black text-white border-2 border-white w-6 h-6 flex items-center justify-center font-extrabold text-xs cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-extrabold truncate" title={item.file.name}>
                    {item.file.name}
                  </p>
                  {item.status === 'error' && (
                    <p className="text-xs text-red-700 font-bold mt-1 leading-tight">
                      {item.error}
                    </p>
                  )}
                  <p className="text-xs text-black/40 font-bold mt-0.5">
                    {(item.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </NeoCard>
            ))}
          </div>

          {items.every((i) => i.status === 'done') && (
            <div className="mt-8 relative">
              <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 bg-black border-2 border-black" />
              <div className="relative border-2 border-black bg-lime p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div>
                  <p className="font-extrabold text-lg sm:text-xl uppercase tracking-tight">
                    All uploads complete!
                  </p>
                  <p className="text-sm font-bold text-black/60 mt-0.5">
                    {items.length} image{items.length !== 1 ? 's' : ''} added to your gallery.
                  </p>
                </div>
                <NeoButton variant="black" onClick={() => navigate('/gallery')}>
                  View Gallery →
                </NeoButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
