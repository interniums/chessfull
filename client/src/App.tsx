// @ts-nocheck

import { Outlet } from 'react-router-dom'
import { AuthProvider } from './context/authProvider'

function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export default App
