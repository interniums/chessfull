// @ts-nocheck

import getSocket from '@/socket'
import { ReloadIcon } from '@radix-ui/react-icons'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function QueuePage() {
  const { mode } = useParams()
  const navigate = useNavigate()
  const sock = getSocket()

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
