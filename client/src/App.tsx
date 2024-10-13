// @ts-nocheck

import { Outlet, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { useEffect } from 'react'

function App() {
  const navigate = useNavigate()

  // useEffect(() => {
  //   navigate('/socket/home')
  // }, [])

  return <Outlet />
}

export default App
