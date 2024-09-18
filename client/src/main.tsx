// @ts-nocheck

import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { GlobalProvider } from './context/GlobalContext.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { routes } from './routes'

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')!).render(
  <GlobalProvider>
    <Toaster />
    <RouterProvider router={router} />
  </GlobalProvider>
)
