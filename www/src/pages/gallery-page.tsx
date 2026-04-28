import { useNavigate, useOutletContext, useSearchParams } from 'react-router'
import useSWR, { useSWRConfig } from 'swr'
import { useState } from 'react'
import { deleteImage, fetcher, listKey, updateImage } from '@/api/client'
import type { ImageMeta, ListResponse } from '@/api/types'
import { useAuth } from '@/use-auth'
import { ImageCard } from '@/components/image-card'
import { Modal } from '@/components/modal'
import { NeoBadge } from '@/components/neo-badge'
import { NeoButton } from '@/components/neo-button'
import { NeoCard } from '@/components/neo-card'
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
  const tag = searchParams.get('tag') || null

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
  function setTag(t: string | null) {
    setSearchParams(
      (prev) => {
        if (t) prev.set('tag', t)
        else prev.delete('tag')
        prev.set('page', '1')
        return prev
      },
      { replace: true }
    )
  }

  const { data, error, isLoading } = useSWR<ListResponse>(listKey(page, pageSize, tag), fetcher)

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
      await mutate(listKey(page, pageSize, tag))
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
      await mutate(listKey(page, pageSize, tag))
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
      <div className="flex items-start justify-between mb-8 gap-6 flex-wrap border-b-2 border-brutal-black pb-8">
        <div>
          <NeoBadge className="mb-4">YOUR COLLECTION</NeoBadge>
          <h1 className="text-brutal-black text-6xl sm:text-7xl font-black uppercase tracking-tighter leading-none">
            GALLERY
          </h1>
          {tag && (
            <div className="flex items-center gap-4 mt-6">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                FILTERED BY:
              </span>

              <NeoBadge>
                {tag}
                <button
                  onClick={() => setTag(null)}
                  className="ml-2 hover:text-white transition-colors cursor-pointer leading-none"
                  aria-label="Clear tag filter"
                >
                  ✕
                </button>
              </NeoBadge>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 mt-2 sm:mt-0">
          <PageSizeSelect value={pageSize} options={PAGE_SIZE_OPTIONS} onChange={setPageSize} />
          {data && (
            <NeoBadge>
              {data.count} IMAGE{data.count !== 1 ? 'S' : ''}
            </NeoBadge>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="border-2 border-brutal-black bg-white shadow-base rounded-base p-6 sm:p-8 font-bold text-sm uppercase tracking-widest text-brutal-black mb-12 animate-pulse">
          LOADING IMAGES...
        </div>
      )}

      {error && (
        <div className="border-2 border-brutal-black bg-red-500 shadow-base rounded-base p-6 sm:p-8 font-bold text-sm text-white mb-12">
          <span className="uppercase tracking-widest text-base block mb-2">ACCESS FAILURE</span>
          {error.message}
        </div>
      )}

      {data && data.items.length === 0 && (
        <NeoCard shadow={4} className="max-w-xl mx-auto mt-16 text-center" contentClassName="p-10">
          <p className="text-6xl mb-6">🖼️</p>
          <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter text-brutal-black mb-4">
            {tag ? 'NO MATCHES' : 'NO IMAGES YET'}
          </h2>
          <div className="border-t-2 border-brutal-black my-6 w-16 mx-auto" />
          <p className="font-bold text-sm sm:text-base text-gray-600 uppercase tracking-widest mb-8">
            {tag
              ? `No images with tag "${tag}". Try a different tag.`
              : 'Upload some images to get started.'}
          </p>
          {tag ? (
            <NeoButton variant="brutal-black" onClick={() => setTag(null)}>
              CLEAR FILTER
            </NeoButton>
          ) : (
            <NeoButton variant="brutal-black" onClick={() => navigate('/upload')}>
              UPLOAD IMAGES →
            </NeoButton>
          )}
        </NeoCard>
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
              onTagClick={(t) => setTag(t)}
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

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="EDIT IMAGE">
        {editTarget && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-brutal-black">
                IMAGE NAME
              </label>
              <NeoInput value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-brutal-black">
                SEMANTIC TAGS
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <NeoInput
                  placeholder="ADD TAG..."
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
                <NeoButton variant="brutal-black" onClick={addTag}>
                  ADD
                </NeoButton>
              </div>
              {editTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
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

            <div className="border-t-2 border-brutal-black my-1" />

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <NeoButton
                variant="brutal-yellow"
                onClick={saveEdit}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </NeoButton>
              <NeoButton
                variant="brutal-white"
                onClick={() => setEditTarget(null)}
                className="flex-1"
              >
                CANCEL
              </NeoButton>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="DELETE IMAGE">
        <div className="flex flex-col gap-6">
          <p className="font-bold text-sm text-brutal-black">
            Are you sure you want to delete this entry? This action cannot be reversed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <NeoButton
              variant="brutal-black"
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1"
            >
              {deleting ? 'DELETING...' : 'DELETE'}
            </NeoButton>
            <NeoButton
              variant="brutal-white"
              onClick={() => setDeleteTarget(null)}
              className="flex-1"
            >
              CANCEL
            </NeoButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
