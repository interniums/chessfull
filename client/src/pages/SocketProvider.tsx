// @ts-nocheck

import { useGlobalContext } from '@/context/GlobalContext'
import useAuth from '@/hooks/useAuth'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import getSocket from '@/socket'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function SocketProvider() {
  const axiosPrivate = useAxiosPrivate()
  const [sock] = useState(getSocket())
  const { globalState, setGlobalState } = useGlobalContext()
  const { auth } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!sock.connected) {
      sock.connect()
    }

    const handleGameInviteForAll = async ({ from, to, gamemode, socketId, fromName }) => {
      if (auth.id === to) {
        setGlobalState((prev) => ({
          ...prev,
          gameInvite: {
            ...prev.gameInvite,
            from,
            gamemode,
            socketId,
            name: fromName,
          },
        }))
      }
    }

    const handleExpiredInvite = ({ to, from }) => {
      if (auth?.id === to || auth?.id === from) {
        setGlobalState((prev) => ({
          ...prev,
          gameInvite: {
            ...prev.gameInvite,
            expired: true,
          },
        }))
      }
    }

    const handleStartGame = ({ roomId, players, mode, orientation }) => {
      navigate(`/socket/game/${roomId}`, { state: { roomId, players, mode, orientation } })
    }

    sock.on('inviteExpired', handleExpiredInvite)
    sock.on('startGame', handleStartGame)
    sock.on('gameInviteForAll', handleGameInviteForAll)

    // Cleanup function
    return () => {
      sock.off('startGame', handleStartGame)
      sock.off('gameInviteForAll', handleGameInviteForAll) / sock.disconnect()
    }
  }, [sock, auth.id, setGlobalState, navigate])

  return <Outlet context={[sock]} />
}
