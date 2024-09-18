// @ts-nocheck

import HomePageFooter from '@/components/HomePageFooter'
import HomePageHeader from '@/components/HomePageHeader'
import PlayPageBoard from '@/components/GamePageBoard'
import { useLocation, useOutletContext } from 'react-router-dom'
import getSocket from '@/socket'
import { useEffect, useState } from 'react'
import GamePageBoard from '@/components/GamePageBoard'

export default function GamePage() {
  const { state } = useLocation()
  const { roomId, players, mode, orientation } = state
  const [sock] = useOutletContext()

  return (
    <>
      <main className="w-full h-full">
        <HomePageHeader variant={'play'} />
        <GamePageBoard mode={mode} players={players} roomId={roomId} orientation={orientation} sock={sock} />
        <HomePageFooter />
      </main>
    </>
  )
}
