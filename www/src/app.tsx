import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { ImagePreview } from '@/components/image-preview'
import { ToastContainer } from '@/components/toast'
import { useToast } from '@/components/use-toast'
import type { ImageMeta } from '@/api/types'

const NAV_ITEMS = [
  { to: '/gallery', label: 'Gallery', activeAccent: 'bg-cyan' },
  { to: '/upload', label: 'Upload', activeAccent: 'bg-lime' },
  { to: '/search', label: 'Search', activeAccent: 'bg-yellow' },
]

const navLinkClass = (isActive: boolean, activeAccent: string) =>
  `px-3 py-2 font-black text-xs sm:text-sm uppercase tracking-wide border transition-all duration-75 cursor-pointer ${
    isActive
      ? `${activeAccent} text-black border-black shadow-[2px_2px_0px_rgba(255,255,255,0.3)]`
      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
  }`

export function App() {
  const [preview, setPreview] = useState<ImageMeta | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { toasts, addToast, removeToast } = useToast()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-black/80 bg-gray-900 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-2">
          <button
            onClick={() => navigate('/gallery')}
            className="flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="text-xl font-black uppercase tracking-tighter text-yellow">SCENE</span>
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
                  ? 'px-3 py-2 font-black text-xs sm:text-sm uppercase tracking-wide border bg-pink/80 text-black border-black shadow-[2px_2px_0px_rgba(255,255,255,0.3)] cursor-pointer'
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
            <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>

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
                  `px-5 py-3 font-black text-sm uppercase tracking-wide border-b border-gray-800 transition-colors ${
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
                  ? 'px-5 py-3 font-black text-sm uppercase tracking-wide bg-pink/80 text-black border-b border-gray-800'
                  : 'hidden'
              }
            >
              Similar
            </NavLink>
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
