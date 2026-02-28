import type { DeleteResponse, ImageMeta, UploadResponse } from './types'

const BASE = '/images'
const AUTH_BASE = '/auth'

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    const detail = Array.isArray(err.detail) ? err.detail[0]?.msg : err.detail
    throw Object.assign(new Error(detail ?? 'Request failed'), {
      status: res.status,
      info: err,
    })
  }
  return res.json() as Promise<T>
}

export function listKey(page: number, pageSize: number) {
  return `${BASE}/list?page=${page}&page_size=${pageSize}`
}

export function searchKey(query: string, page: number, pageSize: number) {
  if (!query.trim()) return null
  return `${BASE}/search?query=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
}

export function similarKey(imageId: string, page: number, pageSize: number) {
  return `${BASE}/${imageId}/similar?page=${page}&page_size=${pageSize}`
}

export function thumbUrl(imageId: string) {
  return `${BASE}/${imageId}/thumb`
}

export function imageUrl(imageId: string) {
  return `${BASE}/${imageId}/`
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw Object.assign(new Error(err.detail ?? 'Upload failed'), { status: res.status })
  }
  return res.json()
}

export async function updateImage(
  imageId: string,
  data: { name?: string; tags?: string[] }
): Promise<ImageMeta> {
  const res = await fetch(`${BASE}/${imageId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw Object.assign(new Error(err.detail ?? 'Update failed'), { status: res.status })
  }
  return res.json()
}

export async function deleteImage(imageId: string): Promise<DeleteResponse> {
  const res = await fetch(`${BASE}/${imageId}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw Object.assign(new Error(err.detail ?? 'Delete failed'), { status: res.status })
  }
  return res.json()
}

export function meKey() {
  return `${AUTH_BASE}/me`
}

export async function logout(): Promise<void> {
  await fetch(`${AUTH_BASE}/logout`, { method: 'POST' })
}

export function googleLoginUrl() {
  return `${AUTH_BASE}/google/login`
}

export function githubLoginUrl() {
  return `${AUTH_BASE}/github/login`
}
