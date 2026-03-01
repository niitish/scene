import { useNavigate } from 'react-router'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <span className="absolute top-8 left-10 text-5xl font-black text-black/5 rotate-[-15deg]">
          SCENE
        </span>
        <span className="absolute bottom-16 right-12 text-4xl font-black text-black/5 rotate-12">
          404
        </span>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 border-2 border-black/5 rotate-12" />
        <div className="absolute bottom-1/3 left-1/5 w-20 h-20 border-2 border-black/5 rotate-[-8deg]" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="absolute inset-0 translate-x-3 translate-y-3 bg-pink border-2 border-black" />
        <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-cyan border-2 border-black" />

        <div className="relative border-2 border-black bg-yellow p-10 text-center">
          <div className="inline-block border-2 border-black bg-black text-yellow font-extrabold text-xs uppercase tracking-widest px-3 py-1 mb-6">
            Error
          </div>

          <div className="font-black text-[7rem] leading-none tracking-tighter text-black mb-1 font-mono">
            404
          </div>

          <div className="border-t-2 border-black my-5" />

          <h1 className="text-xl font-extrabold uppercase tracking-tight text-black mb-2">
            Page not found
          </h1>
          <p className="text-sm font-medium text-black/60 mb-8 max-w-xs mx-auto leading-relaxed">
            This page doesn't exist. Maybe it was deleted, or you followed a bad link.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="border-2 border-black bg-white font-extrabold uppercase tracking-wide px-5 py-2 text-sm shadow-[3px_3px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1a1a1a] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
            >
              ← Go back
            </button>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="border-2 border-black bg-black text-yellow font-extrabold uppercase tracking-wide px-5 py-2 text-sm shadow-[3px_3px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1a1a1a] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
            >
              Go home →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
