import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { ImagePreview } from '@/components/image-preview'
import { ToastContainer } from '@/components/toast'
import { useToast } from '@/components/use-toast'
import { useAuth } from '@/auth-context'
import { GitHubIcon } from '@/components/icons'
import { UserAvatar } from '@/components/user-avatar'
import type { ImageMeta } from '@/api/types'

const NAV_ITEMS = [
  { to: '/gallery', label: 'Gallery', activeAccent: 'bg-cyan' },
  { to: '/upload', label: 'Upload', activeAccent: 'bg-lime' },
  { to: '/search', label: 'Search', activeAccent: 'bg-yellow' },
]

const navLinkClass = (isActive: boolean, activeAccent: string) =>
  `px-3 py-2 font-bold text-xs sm:text-sm uppercase tracking-wide border transition-all duration-75 cursor-pointer ${
    isActive
      ? `${activeAccent} text-black border-black shadow-[2px_2px_0px_rgba(255,255,255,0.3)]`
      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
  }`

export function App() {
  const [preview, setPreview] = useState<ImageMeta | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { toasts, addToast, removeToast } = useToast()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-black/80 bg-gray-900 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-2">
          <button
            onClick={() => navigate('/gallery')}
            className="flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="text-xl font-bold uppercase tracking-tighter text-yellow">SCENE</span>
            <span className="text-xl">🖼️</span>
          </button>

          <nav className="hidden sm:flex items-center gap-1 flex-1 ml-6">
            {NAV_ITEMS.map(({ to, label, activeAccent }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => navLinkClass(isActive, activeAccent)}
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/similar"
              className={({ isActive }) =>
                isActive
                  ? 'px-3 py-2 font-bold text-xs sm:text-sm uppercase tracking-wide border bg-pink/80 text-black border-black shadow-[2px_2px_0px_rgba(255,255,255,0.3)] cursor-pointer'
                  : 'hidden'
              }
            >
              Similar
            </NavLink>
          </nav>

          <a
            href="https://github.com/niitish/scene"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto sm:ml-0 text-white"
            aria-label="GitHub"
          >
            <GitHubIcon size={24} />
          </a>

          {user && (
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <UserAvatar
                name={user.name}
                email={user.email}
                avatarUrl={user.avatar_url}
                size="md"
              />
              <span className="text-xs text-gray-300 font-medium max-w-[120px] truncate">
                {user.name ?? user.email}
              </span>
              <button
                onClick={handleLogout}
                className="border border-gray-600 px-2 py-1 text-xs font-semibold text-gray-300 hover:border-white hover:text-white transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}

          <button
            className="sm:hidden ml-2 border border-gray-600 px-2 py-1 font-medium text-lg cursor-pointer hover:border-white transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <nav className="sm:hidden border-t border-gray-700 flex flex-col">
            {NAV_ITEMS.map(({ to, label, activeAccent }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-5 py-3 font-bold text-sm uppercase tracking-wide border-b border-gray-800 transition-colors ${
                    isActive
                      ? `${activeAccent} text-black`
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/similar"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? 'px-5 py-3 font-bold text-sm uppercase tracking-wide bg-pink/80 text-black border-b border-gray-800'
                  : 'hidden'
              }
            >
              Similar
            </NavLink>
            {user && (
              <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-800">
                <UserAvatar
                  name={user.name}
                  email={user.email}
                  avatarUrl={user.avatar_url}
                  size="sm"
                />
                <span className="text-xs text-gray-300 font-medium flex-1 truncate">
                  {user.name ?? user.email}
                </span>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    handleLogout()
                  }}
                  className="border border-gray-600 px-2 py-1 text-xs font-semibold text-gray-300 hover:border-white hover:text-white transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet context={{ addToast, setPreview }} />
      </main>

      <ImagePreview
        image={preview}
        onClose={() => setPreview(null)}
        onViewSimilar={(id) => {
          navigate(`/similar/${id}`)
          setPreview(null)
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
