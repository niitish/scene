import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { ImagePreview } from '@/components/image-preview'
import { ToastContainer } from '@/components/toast'
import { useToast } from '@/components/use-toast'
import { useAuth } from '@/use-auth'
import { GitHubIcon } from '@/components/icons'
import { UserAvatar } from '@/components/user-avatar'
import type { ImageMeta } from '@/api/types'

const NAV_ITEMS = [
  { to: '/gallery', label: 'Gallery', activeAccent: 'bg-cyan' },
  { to: '/upload', label: 'Upload', activeAccent: 'bg-lime' },
  { to: '/search', label: 'Search', activeAccent: 'bg-yellow' },
]

const navLinkClass = (isActive: boolean, activeAccent: string) =>
  `px-3 py-1.5 font-bold text-xs sm:text-sm uppercase tracking-wide border-2 transition-all duration-75 cursor-pointer rounded-base ${
    isActive
      ? `${activeAccent} text-brutal-black border-brutal-black shadow-none translate-x-[2px] translate-y-[2px]`
      : 'border-transparent text-gray-500 hover:text-brutal-black hover:border-brutal-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px]'
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
    <div className="min-h-screen page-bg relative">
      <header className="border-b-2 border-brutal-black bg-white text-brutal-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-16 gap-2">
          <button
            onClick={() => navigate('/gallery')}
            className="flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="text-2xl font-extrabold uppercase tracking-tighter text-brutal-black">
              SCENE
            </span>
            <span className="text-2xl">🖼️</span>
          </button>

          <nav className="hidden sm:flex items-center gap-2 flex-1 ml-8">
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
              className={({ isActive }) => (isActive ? navLinkClass(true, 'bg-pink/80') : 'hidden')}
            >
              Similar
            </NavLink>
          </nav>

          <a
            href="https://github.com/niitish/scene"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto sm:ml-0 text-brutal-black hover:text-brutal-yellow transition-colors"
            aria-label="GitHub"
          >
            <GitHubIcon size={24} />
          </a>

          {user && (
            <div className="hidden sm:flex items-center gap-3 ml-4">
              <UserAvatar
                name={user.name}
                email={user.email}
                avatarUrl={user.avatar_url}
                size="sm"
              />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest max-w-[120px] truncate">
                {user.name ?? user.email}
              </span>
              <button
                onClick={handleLogout}
                className="border-2 border-brutal-black px-3 py-1 text-[10px] font-bold text-brutal-black uppercase tracking-widest hover:bg-brutal-black hover:text-white transition-all cursor-pointer rounded-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                Logout
              </button>
            </div>
          )}

          <button
            className="sm:hidden ml-2 border-2 border-brutal-black p-2 font-bold text-xl cursor-pointer hover:bg-brutal-stone transition-colors rounded-base"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <nav className="sm:hidden border-t-2 border-brutal-black flex flex-col bg-white">
            {NAV_ITEMS.map(({ to, label, activeAccent }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-5 py-4 font-bold text-sm uppercase tracking-widest border-b-2 border-brutal-black transition-colors ${
                    isActive
                      ? `${activeAccent} text-brutal-black`
                      : 'text-gray-500 hover:text-brutal-black hover:bg-brutal-stone'
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
                  ? 'px-5 py-4 font-bold text-sm uppercase tracking-widest bg-pink/80 text-brutal-black border-b-2 border-brutal-black'
                  : 'hidden'
              }
            >
              Similar
            </NavLink>
            {user && (
              <div className="flex items-center gap-4 px-5 py-4 border-b-2 border-brutal-black bg-brutal-stone/30">
                <UserAvatar
                  name={user.name}
                  email={user.email}
                  avatarUrl={user.avatar_url}
                  size="sm"
                />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex-1 truncate">
                  {user.name ?? user.email}
                </span>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    handleLogout()
                  }}
                  className="border-2 border-brutal-black px-4 py-1.5 text-[10px] font-bold text-brutal-black uppercase tracking-widest hover:bg-brutal-black hover:text-white transition-all cursor-pointer rounded-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] bg-white"
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
        onTagClick={(tag) => {
          navigate(`/gallery?tag=${encodeURIComponent(tag)}`)
          setPreview(null)
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
