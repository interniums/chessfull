// @ts-nocheck

import { io } from 'socket.io-client'

let sock

const getSocket = () => {
  if (!sock) {
    sock = io('http://localhost:3000', {
      extraHeaders: {
        Authorization: `skip-auth`,
      },
    })
  }
  return sock
}

export default getSocket
