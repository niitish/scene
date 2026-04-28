import { useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router'
import { useSWRConfig } from 'swr'
import { NeoBadge } from '@/components/neo-badge'
import { NeoButton } from '@/components/neo-button'
import { NeoCard } from '@/components/neo-card'
import { useUploadQueue } from '@/hooks/use-upload-queue'
import type { OutletContext } from '@/outlet-context'

export function UploadPage() {
  const { addToast } = useOutletContext<OutletContext>()
  const navigate = useNavigate()
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate } = useSWRConfig()

  const { items, addFiles, removeItem, uploadAll, clearAll, pendingCount, doneCount, isUploading } =
    useUploadQueue({ addToast, mutate })

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8 gap-6 flex-wrap border-b-2 border-brutal-black pb-8">
        <div>
          <NeoBadge className="mb-4">ADD TO COLLECTION</NeoBadge>
          <h1 className="text-brutal-black text-6xl sm:text-7xl font-black uppercase tracking-tighter leading-none">
            UPLOAD
          </h1>
        </div>
      </div>

      {!isUploading && (
        <NeoCard
          accent={dragging ? 'bg-brutal-yellow' : 'bg-white'}
          shadow={8}
          className="mb-12 rounded-base"
          contentClassName={`p-10 sm:p-24 text-center cursor-pointer transition-colors duration-75`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div
            className={`text-6xl mb-6 transition-transform duration-100 ${dragging ? 'scale-125' : ''}`}
          >
            {dragging ? '📥' : '📤'}
          </div>
          <h2 className="font-bold text-3xl sm:text-4xl uppercase tracking-tighter text-brutal-black mb-4">
            {dragging ? 'DROP IMAGES HERE' : 'ADD IMAGES'}
          </h2>
          <p className="font-bold text-gray-500 text-sm uppercase tracking-[0.2em]">
            DRAG & DROP OR CLICK TO BROWSE
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
      )}

      {items.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b-2 border-brutal-black pb-8">
            <div>
              <h2 className="font-bold text-2xl sm:text-3xl uppercase tracking-tighter text-brutal-black">
                {items.length} FILE{items.length !== 1 ? 'S' : ''} QUEUED
              </h2>
              {doneCount > 0 && (
                <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">
                  {doneCount} / {items.length} UPLOADED
                </p>
              )}
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <NeoButton
                variant="brutal-yellow"
                display
                onClick={uploadAll}
                disabled={pendingCount === 0 || isUploading}
                className="flex-1 sm:flex-none px-12"
              >
                UPLOAD {pendingCount > 0 ? `(${pendingCount})` : 'ALL'}
              </NeoButton>
              <NeoButton
                variant="brutal-white"
                display
                className="flex-1 sm:flex-none px-10"
                disabled={isUploading}
                onClick={clearAll}
              >
                CLEAR ALL
              </NeoButton>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {items.map((item) => (
              <NeoCard
                key={item.id}
                shadow={4}
                className="overflow-hidden"
                contentClassName="flex flex-col"
              >
                <div
                  className="relative overflow-hidden border-b-2 border-brutal-black"
                  style={{ aspectRatio: '4/3' }}
                >
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className={`w-full h-full object-cover transition-all ${item.status === 'uploading' ? 'grayscale brightness-50' : ''}`}
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-colors ${item.status === 'done' ? 'bg-brutal-yellow/40' : ''} ${
                      item.status === 'error' ? 'bg-red-500/40' : ''
                    }`}
                  >
                    {item.status === 'uploading' && (
                      <div className="bg-brutal-black border-2 border-brutal-black px-3 py-1 font-bold text-white text-xs uppercase tracking-widest animate-pulse rounded-base">
                        PENDING...
                      </div>
                    )}
                    {item.status === 'done' && (
                      <div className="bg-brutal-yellow border-2 border-brutal-black px-4 py-2 font-bold text-brutal-black text-xl shadow-base rounded-base animate-in zoom-in duration-100">
                        ✓
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="bg-red-500 border-2 border-brutal-black px-4 py-2 font-bold text-white text-xl shadow-base rounded-base">
                        ✗
                      </div>
                    )}
                  </div>
                  {item.status !== 'uploading' && item.status !== 'done' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeItem(item.id)
                      }}
                      className="absolute top-2 right-2 bg-brutal-black text-white border-2 border-brutal-black w-8 h-8 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-red-500 transition-colors shadow-base rounded-base"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="p-4 bg-white flex flex-col">
                  <p
                    className="text-xs font-bold uppercase tracking-tight truncate text-brutal-black"
                    title={item.file.name}
                  >
                    {item.file.name}
                  </p>
                  {item.status === 'error' && (
                    <p className="text-[10px] text-red-600 font-bold uppercase mt-1 leading-tight tracking-tight">
                      {item.error}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 font-semibold mt-auto pt-2 uppercase tracking-widest">
                    {(item.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </NeoCard>
            ))}
          </div>

          {items.length > 0 && items.every((i) => i.status === 'done') && (
            <NeoCard
              shadow={4}
              className="mt-16 text-center"
              contentClassName="p-10 sm:p-16 flex flex-col items-center gap-8"
            >
              <div>
                <p className="font-bold text-3xl sm:text-4xl uppercase tracking-tighter text-brutal-black mb-4">
                  UPLOAD COMPLETE
                </p>
                <div className="border-t-2 border-brutal-black my-6 w-16 mx-auto" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  {items.length} IMAGE{items.length !== 1 ? 'S' : ''} ADDED TO GALLERY.
                </p>
              </div>
              <NeoButton
                variant="brutal-black"
                display
                className="px-12 py-4"
                onClick={() => navigate('/gallery')}
              >
                VIEW GALLERY →
              </NeoButton>
            </NeoCard>
          )}
        </div>
      )}
    </div>
  )
}
