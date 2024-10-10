// @ts-nocheck

import { io } from 'socket.io-client'
import useAuth from './hooks/useAuth'

let sock
const getSocket = () => {
  const { auth } = useAuth()
  if (!sock) {
    sock = io('https://chessfull-production-8a3f.up.railway.app' + `?data=${auth.id}`, {
      extraHeaders: {
        Authorization: `skip-auth`,
      },
    })
  }
  return sock
}

export default getSocket
