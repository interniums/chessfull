// @ts-nocheck

import { Outlet } from 'react-router-dom'
import useRefreshToken from '../hooks/useRefreshToken'
import useAuth from '../hooks/useAuth'
import Loading from './Loading'
import getSocket from '@/socket'
import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'

const PersistLogin = () => {
  const { auth, persist } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const refresh = useRefreshToken()
  console.log('game provider mounted')

  useEffect(() => {
    let isMounted = true

    const verifyRefreshToken = async () => {
      try {
        await refresh()
      } catch (err) {
        console.error(err)
      } finally {
        isMounted && setIsLoading(false)
      }
    }

    !auth?.accessToken && persist ? verifyRefreshToken() : setIsLoading(false)

    return () => (isMounted = false)
  }, [])

  return <>{!persist ? <Outlet /> : isLoading ? <Loading /> : <Outlet />}</>
}

export default PersistLogin
