// @ts-nocheck

import getSocket from '@/socket'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { io } from 'socket.io-client'

export default function GameProvider() {
  const [sock, setSock] = useState(getSocket())
  console.log(sock)

  useEffect(() => {
    return () => {
      setSock(sock.disconnect())
    }
  }, [])

  return <Outlet context={[sock]} />
}
