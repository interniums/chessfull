// @ts-nocheck

import { useGlobalContext } from '@/context/GlobalContext'
import useAuth from '@/hooks/useAuth'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import getSocket from '@/socket'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

export default function SocketProvider() {
  const axiosPrivate = useAxiosPrivate()
  const [sock] = useState(getSocket()) // Keep socket instance in state
  const { globalState, setGlobalState } = useGlobalContext()
  const { auth } = useAuth()
  console.log('game provider mounted')

  useEffect(() => {
    // Connect to socket if not already connected
    if (!sock.connected) {
      sock.connect()
    }

    // Register event listener
    const handleGameInviteForAll = async ({ from, to, gamemode }) => {
      console.log('all event gotten')
      if (auth.id === to) {
        console.log('new invite')
        await searchName(from)
        setGlobalState((prev) => ({
          ...prev,
          gameInvite: {
            ...prev.gameInvite,
            from,
            gamemode,
          },
        }))
      }
    }

    sock.on('gameInviteForAll', handleGameInviteForAll)

    // Cleanup function
    return () => {
      sock.off('gameInviteForAll', handleGameInviteForAll) // Remove listener on cleanup
      sock.disconnect() // Disconnect socket
    }
  }, [sock, auth.id, setGlobalState]) // Add auth.id to dependencies

  const searchName = async (from) => {
    const controller = new AbortController()
    try {
      const response = await axiosPrivate.get(`http://localhost:3000/user/${from}`, {
        signal: controller.signal,
      })
      console.log(response)
      setGlobalState((prev) => ({
        ...prev,
        gameInvite: {
          ...prev.gameInvite,
          name: response.data.name,
        },
      }))
    } catch (err) {
      console.error(err)
    }
    controller.abort() // Abort the fetch if the component unmounts
  }

  return <Outlet context={[sock]} />
}
