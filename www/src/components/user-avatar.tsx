import { useState } from 'react'

interface Props {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  size?: 'sm' | 'md'
}

function getInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim()
  if (!source) return '?'
  const parts = source.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return source[0].toUpperCase()
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-7 h-7 text-xs',
}

export function UserAvatar({ name, email, avatarUrl, size = 'md' }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const initials = getInitials(name, email)
  const cls = `${sizeClasses[size]} border border-gray-600 shrink-0`

  if (avatarUrl && !imgFailed) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? email ?? 'User'}
        className={`${cls} object-cover`}
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <div className={`${cls} bg-yellow flex items-center justify-center text-black font-black`}>
      {initials}
    </div>
  )
}
