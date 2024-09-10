// @ts-nocheck
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import WellcomePage from './pages/WellcomePage.tsx'
import PlayPage from './pages/PlayPage.tsx'
import { GlobalProvider } from './context/GlobalContext.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import RequireAuth from './components/RequireAuth.tsx'
import ErrorPage from './components/Error.tsx'
import PersistLogin from './components/PersistLogin.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/wellcome',
        element: <WellcomePage />,
        errorElement: <ErrorPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: '/registration',
        element: <RegisterPage />,
        errorElement: <ErrorPage />,
      },
      // PROTECTED ROUTES
      {
        element: <PersistLogin />,
        children: [
          {
            element: <RequireAuth />,
            children: [
              {
                path: '/home',
                element: <HomePage />,
                errorElement: <ErrorPage />,
              },
              {
                path: '/play',
                element: <PlayPage />,
                errorElement: <ErrorPage />,
              },
            ],
          },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalProvider>
      <Toaster />
      <RouterProvider router={router}></RouterProvider>
    </GlobalProvider>
  </StrictMode>
)
