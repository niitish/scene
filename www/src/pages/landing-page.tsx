import { Link, useNavigate } from 'react-router'
import { GitHubIcon } from '@/components/icons'
import { NeoBadge } from '@/components/neo-badge'
import { NeoButton } from '@/components/neo-button'
import { NeoCard } from '@/components/neo-card'
import { NeoTag } from '@/components/neo-tag'

const FEATURES = [
  {
    tag: 'Gallery',
    accent: 'bg-cyan',
    icon: '🖼️',
    title: 'Browse & Organize',
    desc: 'View your collection in a clean grid. Tag images, filter by tag, and manage your library with ease.',
  },
  {
    tag: 'Upload',
    accent: 'bg-lime',
    icon: '📤',
    title: 'Drag & Drop',
    desc: 'Add images in bulk with drag-and-drop. Automatic thumbnails and AI embeddings process in the background.',
  },
  {
    tag: 'Search',
    accent: 'bg-yellow',
    icon: '🔍',
    title: 'Semantic Search',
    desc: 'Find images by describing them. "Sunset over mountains", "red car". Our AI understands context and concepts.',
  },
  {
    tag: 'Similar',
    accent: 'bg-pink',
    icon: '✨',
    title: 'Visual Similarity',
    desc: 'Click any image to find visually and conceptually similar ones. Discover connections you never knew existed.',
  },
]

const STACK = ['CLIP', 'pgvector', 'FastAPI', 'React', 'Vite']

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen page-bg relative">
      <header className="sticky top-0 z-40 border-b-2 border-gray-800 bg-white">
        <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 hover:opacity-80 transition-opacity"
          >
            <span className="text-lg sm:text-xl font-bold uppercase tracking-tighter text-gray-800">
              SCENE
            </span>
            <span className="text-lg sm:text-xl">🖼️</span>
          </Link>

          <NeoButton variant="yellow" size="sm" onClick={() => navigate('/login')}>
            Log in
          </NeoButton>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-12 sm:pt-20 pb-24">
        <section className="text-center mb-20 sm:mb-28">
          <NeoBadge accent="bg-cyan" rotate={-1} className="mb-6">
            Find images by meaning
          </NeoBadge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold uppercase tracking-tighter leading-[1.1] mb-6 max-w-4xl mx-auto text-gray-800">
            Your visual
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan via-pink to-orange">
              memory engine
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop scrolling through folders. SCENE uses CLIP embeddings and vector search to let you
            find images by meaning. Search by concept, discover by similarity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NeoButton
              variant="yellow"
              display
              onClick={() => navigate('/gallery')}
              className="gap-2"
            >
              Enter Gallery
            </NeoButton>
            <NeoButton
              href="https://github.com/niitish/scene"
              variant="white"
              display
              className="gap-2"
            >
              <GitHubIcon size={20} />
              View Source
            </NeoButton>
          </div>
        </section>

        <section className="mb-24">
          <NeoBadge accent="bg-yellow" variant="flat" className="mb-6">
            How it works
          </NeoBadge>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <NeoCard
                key={f.tag}
                accent="bg-white"
                variant="layered"
                offset={2}
                offsetColor="black"
                className="h-full"
                contentClassName="p-6 h-full"
              >
                <NeoBadge accent={f.accent} rotate={-1} className="mb-4 w-fit">
                  {f.tag}
                </NeoBadge>
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="text-lg font-bold uppercase tracking-tight mb-2 text-gray-800">
                  {f.title}
                </h3>
                <p className="text-sm font-medium text-gray-600 leading-relaxed flex-1">{f.desc}</p>
              </NeoCard>
            ))}
          </div>
        </section>

        <section className="mb-24">
          <NeoCard
            accent="bg-cyan"
            variant="layered"
            offsetAccent="bg-yellow"
            offset={2}
            offsetColor="accent"
            contentClassName="p-8 sm:p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tighter mb-3 text-gray-800">
              Search like you think
            </h2>
            <p className="text-gray-700 font-medium max-w-xl mx-auto mb-6">
              Type &quot;beach at sunset&quot; or &quot;my cat sleeping&quot;. SCENE finds images
              that match the idea. Powered by CLIP and pgvector for fast semantic search.
            </p>
            <NeoButton variant="yellow" display onClick={() => navigate('/search')}>
              Try Search
            </NeoButton>
          </NeoCard>
        </section>

        <section className="mb-24">
          <NeoBadge accent="bg-gray-800" className="text-yellow mb-6">
            Tech Stack
          </NeoBadge>
          <div className="flex flex-wrap gap-3">
            {STACK.map((tech) => (
              <NeoTag key={tech} label={tech} />
            ))}
          </div>
        </section>

        <section>
          <NeoCard
            accent="bg-pink"
            variant="layered"
            offset={2.5}
            offsetAccent="bg-yellow"
            contentClassName="p-8 sm:p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tighter mb-3 text-gray-800">
              Ready to organize your images?
            </h2>
            <p className="font-bold text-gray-700 mb-6">
              Log in with Google or GitHub and start building your visual memory.
            </p>
            <NeoButton variant="yellow" display onClick={() => navigate('/login')}>
              Get Started
            </NeoButton>
          </NeoCard>
        </section>
      </main>

      <footer className="border-t-2 border-gray-800 py-8 mt-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold uppercase tracking-tighter text-gray-800">
              SCENE
            </span>
            <span className="text-lg">🖼️</span>
          </div>
          <a
            href="https://github.com/niitish/scene"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
          >
            <GitHubIcon size={18} />
            niitish/scene
          </a>
        </div>
      </footer>
    </div>
  )
}
