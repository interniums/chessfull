// routes.tsx
import { RouteObject } from 'react-router-dom'
import App from './App.tsx'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import WellcomePage from './pages/WellcomePage.tsx'
import QueuePage from './pages/QueuePage.tsx'
import GamePage from './pages/GamePage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import ErrorPage from './components/Error.tsx'
import PersistLogin from './components/PersistLogin.tsx'
import RequireAuth from './components/RequireAuth.tsx'
import GameProvider from './pages/GameProvider.tsx'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/wellcome',
        element: <WellcomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/registration',
        element: <RegisterPage />,
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
              },
              {
                path: '/game',
                element: <GameProvider />,
                children: [
                  {
                    path: '/game/:id',
                    element: <GamePage />,
                  },
                  {
                    path: '/game/queue/:mode',
                    element: <QueuePage />,
                  },
                ],
              },
              {
                path: '/profile/:id',
                element: <ProfilePage />,
              },
            ],
          },
        ],
      },
    ],
  },
]
