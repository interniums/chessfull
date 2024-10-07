// @ts-nocheck

import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import getSocket from '@/socket'
import { ReloadIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'

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

  const joinQueue = () => {
    sock.emit('joinQueue', { gameMode, id })
    setAreInQueue(true)
    console.log('joined queue')
  }

  const handleCancel = () => {
    sock.emit('cancel queue')
    navigate(`/socket/home`)
  }

  return (
    <main className="inset-0 absolute z-50 bg-white flex items-center justify-center">
      <div className="grid gap-6 items-center justify-center">
        <div className="w-full flex items-center justify-center">
          <ReloadIcon className="animate-spin size-40" />
        </div>
        <div className="text-center text-xl">Waiting for an opponent...</div>
        <div className="w-full">
          <Button className="w-full font-bold text-2xl" onClick={() => handleCancel()} variant={'outline'}>
            Cancel
          </Button>
        </div>
      </div>
    </main>
  )
}
