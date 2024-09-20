// @ts-nocheck

import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import getSocket from '@/socket'
import { ReloadIcon } from '@radix-ui/react-icons'

export default function QueuePage() {
  const { mode } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const { gameMode, id } = state || {}
  const [areInQueue, setAreInQueue] = useState(false)
  const [sock] = useOutletContext()

  useEffect(() => {
    if (!areInQueue) {
      joinQueue()
    }
  }, [areInQueue])

  useEffect(() => {
    sock.on('startGame', handleStartGame)

    return () => {
      sock.off('startGame', handleStartGame)
    }
  }, [navigate])

  const joinQueue = () => {
    sock.emit('joinQueue', { gameMode, id })
    setAreInQueue(true)
    console.log('joined queue')
  }

  const handleStartGame = ({ roomId, players, mode, orientation }) => {
    navigate(`/game/${roomId}`, { state: { roomId, players, mode, orientation } })
  }

  return (
    <main className="inset-0 absolute z-50 bg-white flex items-center justify-center">
      <div className="grid gap-6 items-center justify-center">
        <div className="w-full flex items-center justify-center">
          <ReloadIcon className="animate-spin size-56" />
        </div>
        <div className="text-center text-3xl">Waiting for an opponent...</div>
      </div>
    </main>
  )
}
