// @ts-nocheck

import HomePageFooter from './HomePageFooter'
import HomePageHeader from './HomePageHeader'
import pawn from '../assets/pawn.png'
import queen from '../assets/queen.png'
import rook from '../assets/rook.png'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReloadIcon } from '@radix-ui/react-icons'
import getSocket from '@/socket'
import useAuth from '@/hooks/useAuth'

export default function HomePageMain({ socket }) {
  const [gameMode, setGameMode] = useState('blitz')
  const [startGame, setStartGame] = useState(false)
  const navigate = useNavigate()
  const sock = getSocket()
  const { auth } = useAuth()

  useEffect(() => {
    if (startGame) {
      sock.emit('joinQueue', { gameMode, id: auth.id })
      navigate(`/queue/${gameMode}`)
    }
  }, [startGame])

  return (
    <main className="h-full">
      <HomePageHeader />
      <div className="w-full h-full items-center content-center justify-center grid">
        <ToggleGroup
          type="single"
          className="flex justify-center gap-20"
          value={gameMode}
        >
          <ToggleGroupItem
            value="bullet"
            className="h-max py-4 px-8 rounded-md"
            onClick={() => setGameMode('bullet')}
          >
            <div>
              <h1 className="text-2xl text-center">Bullet</h1>
              <img src={rook} alt="pawn" className="size-32" />
              <div>
                <h1 className="text-xl text-center">
                  Rank: <span>A</span>
                </h1>
                <h1 className="text-xl text-center">
                  Elo: <span>2500</span>
                </h1>
              </div>
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="blitz"
            className="h-max py-4 px-8 rounded-md"
            onClick={() => setGameMode('blitz')}
          >
            <div className="">
              <h1 className="text-2xl text-center">Blitz</h1>
              <img src={queen} alt="pawn" className="size-32" />
              <div>
                <h1 className="text-xl text-center">
                  Rank: <span>B</span>
                </h1>
                <h1 className="text-xl text-center">
                  Elo: <span>2100</span>
                </h1>
              </div>
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem
            onClick={() => setGameMode('rapid')}
            value="rapid"
            className="h-max py-4 px-8 rounded-md"
          >
            <div>
              <h1 className="text-2xl text-center">Rapid</h1>
              <img src={pawn} alt="pawn" className="size-32" />
              <div>
                <h1 className="text-xl text-center">
                  Rank: <span>S</span>
                </h1>
                <h1 className="text-xl text-center">
                  Elo: <span>1200</span>
                </h1>
              </div>
            </div>
          </ToggleGroupItem>
        </ToggleGroup>
        <Button
          onClick={() => setStartGame(true)}
          className="text-2xl py-6 w-full mt-8"
          variant={'outline'}
        >
          {`Find ${gameMode} game`}
        </Button>
      </div>
      <HomePageFooter />
    </main>
  )
}
