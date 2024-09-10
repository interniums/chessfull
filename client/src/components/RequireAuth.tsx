// @ts-nocheck

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { useGlobalContext } from '@/context/GlobalContext'
import { useEffect, useState } from 'react'

const RequireAuth = () => {
  const { globalState, setGlobalState } = useGlobalContext()
  const { auth } = useAuth()
  const location = useLocation()

  useEffect(() => {
    setGlobalState((prev) => ({
      ...prev,
      unauthorizedRedirectMessage: 'Login to visit this page',
    }))
  }, [])

  return auth?.accessToken ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />
}

export default RequireAuth
