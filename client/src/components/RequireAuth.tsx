// @ts-nocheck

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { useGlobalContext } from '@/context/GlobalContext'
import { useEffect, useState } from 'react'
import useRefreshToken from '@/hooks/useRefreshToken'

const RequireAuth = () => {
  const { globalState, setGlobalState } = useGlobalContext()
  const { auth } = useAuth()
  const location = useLocation()
  const refresh = useRefreshToken()
  const [loading, setLoading] = useState(false)
  console.log(document.cookie)

  useEffect(() => {
    setLoading(true)
    setGlobalState((prev) => ({
      ...prev,
      unauthorizedRedirectMessage: 'Login to visit this page',
    }))

    if (!auth.username) {
      const ref = () => refresh()
      ref()
    }
    setLoading(false)
  }, [])

  console.log(auth)
  return (
    <>
      {loading ? (
        <div>Loading</div>
      ) : (
        <>
          {auth?.username ? (
            <Outlet />
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )}
        </>
      )}
    </>
  )
}

export default RequireAuth
