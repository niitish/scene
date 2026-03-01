import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { App } from '@/app'
import { GalleryPage } from '@/pages/gallery-page'
import { LoginPage } from '@/pages/login-page'
import { SearchPage } from '@/pages/search-page'
import { SimilarPage } from '@/pages/similar-page'
import { UploadPage } from '@/pages/upload-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { AuthProvider } from '@/auth-context'
import { RequireAuth } from '@/components/require-auth'
import { SWRConfig } from 'swr'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SWRConfig
      value={{
        onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
          if (err.status >= 400 && err.status < 500) return
          if (retryCount >= 3) return
          setTimeout(() => revalidate({ retryCount }), 5000)
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route
              element={
                <RequireAuth>
                  <App />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/gallery" replace />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="similar">
                <Route index element={<Navigate to="/gallery" replace />} />
                <Route path=":imageId" element={<SimilarPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </SWRConfig>
  </StrictMode>
)
