// @ts-nocheck

import { ToastAction } from '@/components/ui/toast'
import { useGlobalContext } from '@/context/GlobalContext'
import { useToast } from '@/hooks/use-toast'
import useAuth from '@/hooks/useAuth'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import getSocket from '@/socket'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

export default function SocketProvider() {
  const isDynamicGameRoute =
    /^\/socket\/game\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

  const location = useLocation()
  const [sock] = useState(getSocket())
  const axiosPrivate = useAxiosPrivate()
  const { globalState, setGlobalState } = useGlobalContext()
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [areInGame, setAreInGame] = useState(false)
  const [newInvite, setNewInvite] = useState(false)

  useEffect(() => {
    if (!sock.connected) {
      sock.connect()
    }

    const handleGameInviteForAll = ({ from, to, gamemode, socketId, fromName }) => {
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
      if ([auth?.id, from].includes(to)) {
        setGlobalState((prev) => ({
          ...prev,
          gameInvite: {
            ...prev.gameInvite,
            expired: true,
          },
        }))
      }
    }

    const handleStartGame = async ({ roomId, players, mode, orientation }) => {
      if (!isDynamicGameRoute.test(location.pathname)) {
        navigate(`/socket/game/${roomId}`, { state: { roomId, players, mode, orientation } })
      } else {
        navigate(`/socket/game/${roomId}`, { state: { roomId, players, mode, orientation } })
        window.location.reload()
      }
    }

    const handleRecieveMessage = ({ populatedMessage }) => {
      setGlobalState((prev) => ({ ...prev, newMessage: true, conversationId: populatedMessage.conversationId }))
      if (!isDynamicGameRoute.test(location.pathname)) {
        toast({
          title: `New message`,
          description: `${populatedMessage.sender.username}: ${populatedMessage.content}`,
          action: (
            <ToastAction
              onClick={() =>
                navigate('/socket/messages', {
                  state: {
                    conversationIdFromLocation: populatedMessage.conversationId,
                    showMessagesFromState: true,
                    companionFromState: populatedMessage.sender._id,
                  },
                })
              }
              altText="go to message"
            >
              Message
            </ToastAction>
          ),
        })
      }
    }

    const handleNewFriendInvite = () => {
      setGlobalState((prev) => ({ ...prev, newFriendInvite: true }))
      toast({
        title: 'New friends invite',
      })
    }

    // Register socket listeners
    sock.on('startGame', handleStartGame)
    sock.on('inviteExpired', handleExpiredInvite)
    sock.on('gameInviteForAll', handleGameInviteForAll)
    sock.on('messageReceived', handleRecieveMessage)
    sock.on('newFriendInvite', handleNewFriendInvite)

    // Cleanup on unmount
    return () => {
      sock.off('newFriendInvite', handleNewFriendInvite)
      sock.off('startGame', handleStartGame)
      sock.off('inviteExpired', handleExpiredInvite)
      sock.off('gameInviteForAll', handleGameInviteForAll)
      sock.off('messageRecieved', handleRecieveMessage)
    }
  }, [sock, auth.id, setGlobalState, navigate, location])

  useEffect(() => {
    const controller = new AbortController()

    const checkForReconnect = async () => {
      try {
        const response = await axiosPrivate.get(
          `https://chessfull-production.up.railway.app/game/reconnect/${auth.id}`,
          {
            signal: controller.signal,
          }
        )
        if (response.status === 200) {
          showReconnectToast(response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    // Check for reconnect if not on dynamic game route
    if (!isDynamicGameRoute.test(location.pathname)) {
      checkForReconnect()
    }

    // Handle room events based on current route
    if (areInGame) {
      if (!isDynamicGameRoute.test(location.pathname)) {
        console.log('Leaving room')
        sock.emit('leaveRoom')
      } else if (isDynamicGameRoute.test(location.pathname)) {
        console.log('Reconnecting to room')
        sock.emit('reconnectUser')
      }
    }

    // invite toast
    if (globalState?.gameInvite.gamemode && !newInvite && !isDynamicGameRoute.test(location.pathname)) {
      setNewInvite(true)
      toast({
        title: 'New game invite',
        description: `User ${globalState?.gameInvite.name} invited you to play ${globalState?.gameInvite.gamemode}`,
        duration: 20000,
        action: (
          <ToastAction altText="Accept" onClick={handleAcceptGameInvite}>
            Accept
          </ToastAction>
        ),
      })
    }
    if (globalState?.gameInvite.expired) {
      toast({
        title: 'Invite expired',
      })
    }

    const handleAcceptRematch = (from, to, fromName, socketId, gamemode) => {
      sock.emit('rematchAccepted', { from, to, fromName, socketId, gamemode })
    }

    // rematch toast
    sock.on('offerRematch', ({ from, to, fromName, socketId, gamemode }) => {
      if (to === auth.id && !isDynamicGameRoute.test(location.pathname)) {
        toast({
          title: `User ${fromName} offers rematch`,
          action: (
            <ToastAction altText="Accept" onClick={() => handleAcceptRematch(from, to, fromName, socketId, gamemode)}>
              Accept
            </ToastAction>
          ),
        })
      }
    })

    return () => controller.abort()
  }, [location, areInGame, globalState, newInvite, toast])

  const handleAcceptGameInvite = () => {
    sock.emit('gameInviteAccepted', {
      to: auth.id,
      from: globalState?.gameInvite.from,
      gamemode: globalState?.gameInvite.gamemode,
      socketId: globalState?.gameInvite.socketId,
      fromName: globalState?.gameInvite.name,
    })
    setGlobalState((prev) => ({
      ...prev,
      gameInvite: {
        ...prev.gameInvite,
        from: '',
        gamemode: '',
        socketId: '',
        name: '',
        expired: false,
      },
    }))
    setNewInvite(false)
  }

  const showReconnectToast = (data) => {
    setAreInGame(true)
    toast({
      title: 'Oh!',
      description: 'You have an unfinished game',
      duration: 20000,
      action: (
        <ToastAction altText="Reconnect" onClick={() => navigate(`/socket/game/${data.roomId}`, { state: data })}>
          Reconnect
        </ToastAction>
      ),
    })
  }

  return <Outlet context={[sock]} />
}
