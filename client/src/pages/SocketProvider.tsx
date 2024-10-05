// @ts-nocheck

import getSocket from '@/socket'
import { useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { io } from 'socket.io-client'

export default function SocketProvider() {
  const [sock, setSock] = useState(getSocket())
  console.log('game provider mounted')

  useEffect(() => {
    if (!sock.connected) {
      sock.connect()
    }

    return () => {
      setSock(sock.disconnect())
    }
  }, [])

  return <Outlet context={[sock]} />
}
