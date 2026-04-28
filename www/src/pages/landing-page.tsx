import { Link, useNavigate } from 'react-router'
import { GitHubIcon } from '@/components/icons'
import { NeoBadge } from '@/components/neo-badge'
import { NeoButton } from '@/components/neo-button'

const FEATURES = [
  {
    tag: 'GALLERY',
    icon: '01',
    title: 'BROWSE & ORGANIZE',
    desc: 'View your collection in a clean grid. Tag, filter, and manage your visual library with ease.',
  },
  {
    tag: 'UPLOAD',
    icon: '02',
    title: 'DRAG & DROP',
    desc: 'Bulk upload with drag-and-drop. Auto thumbnails & AI embeddings process in the background.',
  },
  {
    tag: 'SEARCH',
    icon: '03',
    title: 'SEMANTIC SEARCH',
    desc: '"Sunset over mountains" - SCENE understands context, concepts, and moods.',
  },
  {
    tag: 'SIMILAR',
    icon: '04',
    title: 'VISUAL SIMILARITY',
    desc: 'Click any image to find visually similar ones. Discover connections you never knew existed.',
  },
]

const HOW_IT_WORKS = [
  {
    num: '01',
    title: 'UPLOAD',
    desc: 'Drag and drop files. SCENE processes auto-thumbnails & embeddings.',
  },
  {
    num: '02',
    title: 'PROCESS',
    desc: 'CLIP generates semantic embeddings. pgvector indexes them instantly.',
  },
  {
    num: '03',
    title: 'SEARCH',
    desc: "Describe what you're looking for in plain English. Find images by concepts.",
  },
]

const STACK = ['CLIP', 'pgvector', 'FastAPI', 'React', 'Vite', 'PostgreSQL', 'Docker']

function FeatureCell({ tag, icon, title, desc }: (typeof FEATURES)[number]) {
  return (
    <div className="bg-white p-5 sm:p-10 flex flex-col h-full group hover:bg-brutal-stone transition-colors duration-200">
      <div className="flex items-start justify-between mb-6 sm:mb-16">
        <NeoBadge variant="brutal-black">{tag}</NeoBadge>
        <span className="font-mono text-4xl sm:text-5xl font-extrabold text-gray-300 group-hover:text-brutal-black transition-colors duration-200 tracking-tight">
          {icon}
        </span>
      </div>
      <div className="mt-auto">
        <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight mb-2 sm:mb-3 text-brutal-black">
          {title}
        </h3>
        <p className="text-sm sm:text-base font-medium text-muted leading-relaxed max-w-sm">
          {desc}
        </p>
      </div>
    </div>
  )
}

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg relative selection:bg-brutal-yellow selection:text-brutal-black">
      <header className="sticky top-0 z-40 border-b-2 border-brutal-black bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer shrink-0">
            <span className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-brutal-black">
              SCENE
            </span>
            <span className="text-2xl sm:text-3xl">🖼️</span>
          </Link>

          <NeoButton variant="brutal-black" size="sm" onClick={() => navigate('/login')}>
            LOG IN
          </NeoButton>
        </div>
      </header>

      <section className="page-bg border-b-2 border-brutal-black relative">
        <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-16 pb-10 sm:pb-24 min-h-[calc(100vh-10rem)] grid place-content-center">
          <div className="max-w-5xl">
            <NeoBadge variant="brutal-white" className="mb-4 sm:mb-8">
              FIND IMAGES BY MEANING
            </NeoBadge>

            <h1 className="font-extrabold uppercase tracking-tight leading-none mb-4 sm:mb-10 text-brutal-black text-7xl sm:text-8xl lg:text-9xl wrap-break-word">
              VISUAL
              <br />
              <span className="inline-block bg-brutal-yellow text-brutal-black border-2 border-brutal-black px-3 py-1 my-1">
                MEMORY
              </span>
              <br />
              ENGINE.
            </h1>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-10 items-end">
              <p className="text-lg sm:text-2xl font-semibold text-gray-600 leading-normal mb-1 sm:mb-0">
                Stop scrolling through folders.{' '}
                <strong className="text-brutal-black bg-brutal-yellow px-2 py-0.5">SCENE</strong>{' '}
                uses CLIP embeddings and vector search to find images by meaning.
              </p>

              <div className="flex flex-wrap sm:flex-row gap-3 sm:gap-4 md:justify-end">
                <NeoButton variant="brutal-yellow" display onClick={() => navigate('/gallery')}>
                  ENTER GALLERY →
                </NeoButton>
                <NeoButton href="https://github.com/niitish/scene" variant="brutal-white" display>
                  <GitHubIcon size={20} />
                  VIEW SOURCE
                </NeoButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-brutal-black bg-brutal-black">
        <div className="grid lg:grid-cols-[1fr_2fr] divide-y-[3px] lg:divide-y-0 lg:divide-x-2 divide-brutal-black">
          <div className="bg-brutal-stone p-6 sm:p-16 flex flex-col justify-between">
            <NeoBadge className="w-fit mb-8 sm:mb-12">CAPABILITIES</NeoBadge>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-brutal-black leading-[0.9]">
              FOUR
              <br />
              SUPER
              <br />
              POWERS
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 divide-y-[3px] sm:divide-y-0 divide-brutal-black">
            <div className="border-b-[3px] sm:border-r-2 border-brutal-black">
              <FeatureCell {...FEATURES[0]} />
            </div>
            <div className="border-b-2 border-brutal-black">
              <FeatureCell {...FEATURES[1]} />
            </div>
            <div className="sm:border-r-[3px] border-b-[3px] sm:border-b-0 border-brutal-black">
              <FeatureCell {...FEATURES[2]} />
            </div>
            <div className="">
              <FeatureCell {...FEATURES[3]} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-24">
          <div className="mb-8 sm:mb-20">
            <NeoBadge variant="brutal-white" className="mb-4 sm:mb-6">
              ARCHITECTURE
            </NeoBadge>
            <h2 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-brutal-black">
              HOW IT WORKS
            </h2>
          </div>

          <div className="flex flex-col border-t-2 border-brutal-black">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.num}
                className="flex flex-col md:flex-row md:items-center border-b-2 border-brutal-black group"
              >
                <div className="font-mono text-4xl sm:text-6xl font-extrabold text-gray-300 p-5 md:p-10 md:w-48 border-b-[3px] md:border-b-0 md:border-r-2 border-brutal-black bg-brutal-stone group-hover:bg-brutal-yellow group-hover:text-brutal-black transition-colors">
                  {step.num}
                </div>
                <div className="p-5 md:p-10 flex-1">
                  <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-brutal-black mb-1 sm:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-base sm:text-lg text-muted font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-[3px] border-b-2 border-brutal-black bg-brutal-black text-white">
        <div className="grid lg:grid-cols-2 divide-y-[3px] lg:divide-y-0 lg:divide-x-2 divide-brutal-black">
          <div className="p-6 sm:p-16 lg:p-24 flex flex-col justify-center">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight leading-[0.9] mb-6 sm:mb-8">
              SEARCH LIKE
              <br />
              YOU THINK
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 font-medium mb-8 sm:mb-12 max-w-md leading-relaxed">
              Type "beach at sunset" or "my cat sleeping". SCENE finds images that match the idea,
              not just metadata.
            </p>
            <div className="space-y-3 sm:space-y-4 font-mono text-xs sm:text-base text-gray-300 mb-8 sm:mb-12">
              <div className="flex gap-4 items-center">
                <span className="w-2 h-2 bg-brutal-yellow"></span> "sunset over mountains"
              </div>
              <div className="flex gap-4 items-center">
                <span className="w-2 h-2 bg-white"></span> "fluffy cat on a couch"
              </div>
              <div className="flex gap-4 items-center">
                <span className="w-2 h-2 bg-brutal-stone"></span> "minimalist architecture"
              </div>
            </div>
            <NeoButton
              variant="brutal-yellow"
              display
              onClick={() => navigate('/search')}
              className="w-fit"
            >
              TRY SEARCH →
            </NeoButton>
          </div>

          <div className="p-6 sm:p-16 lg:p-24 flex flex-col justify-center bg-black">
            <NeoBadge variant="brutal-black" className="w-fit mb-6 sm:mb-8 border-gray-700">
              STACK
            </NeoBadge>
            <h2 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tight leading-none mb-8 sm:mb-12">
              BUILT WITH
            </h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {STACK.map((tech) => (
                <div
                  key={tech}
                  className="border-2 sm:border-2 border-gray-700 text-gray-300 px-3 py-2 sm:px-5 sm:py-3 font-mono font-bold text-xs sm:text-base uppercase tracking-widest hover:border-white hover:text-white transition-colors"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brutal-yellow py-16 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-extrabold uppercase tracking-tight mb-6 sm:mb-8 text-brutal-black leading-[0.9]">
            READY TO
            <br />
            ORGANIZE?
          </h2>
          <p className="font-bold text-gray-800 mb-8 sm:mb-12 text-base sm:text-2xl max-w-2xl mx-auto">
            Log in with Google or GitHub and start building your visual memory.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <NeoButton
              variant="brutal-black"
              display
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto"
            >
              GET STARTED →
            </NeoButton>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-brutal-black bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-brutal-black flex items-center gap-2">
            SCENE 🖼️
          </span>
          <a
            href="https://github.com/niitish/scene"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs sm:text-sm font-bold text-gray-500 hover:text-brutal-black transition-colors flex items-center gap-2"
          >
            <GitHubIcon size={16} />
            NIITISH/SCENE
          </a>
        </div>
      </footer>
    </div>
  )
}
