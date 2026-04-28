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
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
}

export function UserAvatar({ name, email, avatarUrl, size = 'md' }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const initials = getInitials(name, email)
  const cls = `${sizeClasses[size]} border-2 border-brutal-black shrink-0 rounded-base`

  if (avatarUrl && !imgFailed) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? email ?? 'User'}
        className={`${cls} object-cover shadow-base`}
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <div
      className={`${cls} bg-brutal-yellow flex items-center justify-center text-brutal-black font-bold uppercase tracking-tighter shadow-base`}
    >
      {initials}
    </div>
  )
}
