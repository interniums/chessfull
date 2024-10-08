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
import SocketProvider from './pages/SocketProvider.tsx'
import ComputerGame from './pages/ComputerGame.tsx'
// import GameProvider from './pages/GameProvider.tsx'

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
                path: '/socket',
                element: <SocketProvider />,
                children: [
                  {
                    path: '/socket/home',
                    element: <HomePage />,
                  },
                  {
                    path: '/socket/game/:id',
                    element: <GamePage />,
                  },
                  {
                    path: '/socket/game/computer',
                    element: <ComputerGame />,
                  },
                  {
                    path: '/socket/game/queue/:mode',
                    element: <QueuePage />,
                  },
                  {
                    path: '/socket/profile/:id',
                    element: <ProfilePage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]
