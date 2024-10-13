// @ts-nocheck

import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import './index.scss'
import { GlobalProvider } from './context/GlobalContext.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { routes } from './routes'
import { AuthProvider } from './context/AuthProvider.tsx'

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <GlobalProvider>
      <Toaster />
      <RouterProvider router={router} />
    </GlobalProvider>
  </AuthProvider>
)
