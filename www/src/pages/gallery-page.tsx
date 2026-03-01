import { useNavigate, useOutletContext, useSearchParams } from 'react-router'
import useSWR, { useSWRConfig } from 'swr'
import { useState } from 'react'
import { deleteImage, fetcher, listKey, updateImage } from '@/api/client'
import type { ImageMeta, ListResponse } from '@/api/types'
import { useAuth } from '@/auth-context'
import { ImageCard } from '@/components/image-card'
import { Modal } from '@/components/modal'
import { NeoButton } from '@/components/neo-button'
import { NeoInput } from '@/components/neo-input'
import { NeoTag } from '@/components/neo-tag'
import { PageSizeSelect } from '@/components/page-size-select'
import { Pagination } from '@/components/pagination'
import type { OutletContext } from '@/outlet-context'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function GalleryPage() {
  const { addToast, setPreview } = useOutletContext<OutletContext>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { mutate } = useSWRConfig()

  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const rawSize = Number(searchParams.get('size') || 20)
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawSize) ? rawSize : 20

  function setPage(p: number) {
    setSearchParams(
      (prev) => {
        prev.set('page', String(p))
        return prev
      },
      { replace: true }
    )
  }
  function setPageSize(s: number) {
    setSearchParams(
      (prev) => {
        prev.set('size', String(s))
        prev.set('page', '1')
        return prev
      },
      { replace: true }
    )
  }

  const { data, error, isLoading } = useSWR<ListResponse>(listKey(page, pageSize), fetcher)

  const [editTarget, setEditTarget] = useState<ImageMeta | null>(null)
  const [editName, setEditName] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  function openEdit(image: ImageMeta) {
    setEditTarget(image)
    setEditName(image.name)
    setEditTags([...image.tags])
    setTagInput('')
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !editTags.includes(t)) setEditTags((prev) => [...prev, t])
    setTagInput('')
  }

  async function saveEdit() {
    if (!editTarget) return
    setSaving(true)
    try {
      await updateImage(editTarget.id, { name: editName, tags: editTags })
      await mutate(listKey(page, pageSize))
      addToast('Image updated', 'success')
      setEditTarget(null)
    } catch (e: unknown) {
      addToast((e as Error).message ?? 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteImage(deleteTarget)
      await mutate(listKey(page, pageSize))
      addToast('Image deleted', 'success')
      setDeleteTarget(null)
    } catch (e: unknown) {
      addToast((e as Error).message ?? 'Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const hasMore = data ? data.items.length === pageSize : false

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">Gallery</h1>
        <div className="flex items-center gap-3">
          <PageSizeSelect value={pageSize} options={PAGE_SIZE_OPTIONS} onChange={setPageSize} />
          {data && (
            <span className="border border-black shadow-[2px_2px_0px_#1a1a1a] px-3 py-1 bg-cyan/80 font-medium text-sm">
              {data.count} images
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="border border-black shadow-[4px_4px_0px_#1a1a1a] bg-gray-200 animate-pulse"
              style={{ aspectRatio: '4/3' }}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="border border-black shadow-[4px_4px_0px_#1a1a1a] bg-pink/70 p-4 sm:p-6 font-bold text-sm">
          Failed to load images: {error.message}
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="border border-black shadow-[4px_4px_0px_#1a1a1a] bg-yellow/60 p-8 sm:p-10 text-center">
          <p className="text-xl sm:text-2xl font-semibold">No images yet!</p>
          <p className="font-bold mt-2 text-sm">Upload some images to get started.</p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {data.items.map((img) => (
            <ImageCard
              key={img.id}
              image={img}
              currentUserId={user?.id}
              isAdmin={user?.role === 'ADMIN'}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onViewSimilar={(id) => navigate(`/similar/${id}`)}
              onPreview={setPreview}
            />
          ))}
        </div>
      )}

      {data && (data.items.length === pageSize || page > 1) && (
        <Pagination
          page={page}
          hasMore={hasMore}
          onPrev={() => setPage(Math.max(1, page - 1))}
          onNext={() => setPage(page + 1)}
        />
      )}

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Image">
        {editTarget && (
          <div className="flex flex-col gap-4">
            <NeoInput label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase tracking-wide">Tags</label>
              <div className="flex gap-2">
                <NeoInput
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  className="flex-1 min-w-0"
                />
                <NeoButton variant="lime" onClick={addTag}>
                  Add
                </NeoButton>
              </div>
              {editTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {editTags.map((tag) => (
                    <NeoTag
                      key={tag}
                      label={tag}
                      onRemove={() => setEditTags((prev) => prev.filter((t) => t !== tag))}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <NeoButton variant="yellow" onClick={saveEdit} disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save'}
              </NeoButton>
              <NeoButton variant="white" onClick={() => setEditTarget(null)}>
                Cancel
              </NeoButton>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Image">
        <div className="flex flex-col gap-4">
          <p className="font-bold text-sm">
            Are you sure you want to delete this image? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <NeoButton
              variant="pink"
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </NeoButton>
            <NeoButton variant="white" onClick={() => setDeleteTarget(null)}>
              Cancel
            </NeoButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
