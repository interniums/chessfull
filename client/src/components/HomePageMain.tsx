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
import useAuth from '@/hooks/useAuth'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { axiosPrivate } from '@/api/axios'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from './ui/toast'

export default function HomePageMain({ socket }) {
  const TIME_TO_RECONNECT = 20000
  const [gameMode, setGameMode] = useState('blitz')
  const [startGame, setStartGame] = useState(false)
  const [timeoutExpired, setTimeoutExpired] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuth()
  const { toast } = useToast()
  const axiosPrivate = useAxiosPrivate()

  useEffect(() => {
    const controller = new AbortController()
    const checkForReconnect = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/game/reconnect/${auth.id}`, {
          signal: controller.signal,
        })

        if (response.status === 200) {
          showReconnectToast(response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }
    checkForReconnect()

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (startGame) {
      navigateToQueue()
    }
  }, [startGame])

  const showReconnectToast = (data) => {
    toast({
      title: 'Oh!',
      description: 'You have an unfinished game',
      duration: TIME_TO_RECONNECT,
      action: (
        <ToastAction
          altText="Reconnect"
          onClick={() => {
            timeoutExpired ? null : handleReconnect(data)
          }}
        >
          Reconnect
        </ToastAction>
      ),
    })
  }

  const handleReconnect = (data) => {
    navigate(`/game/${data.roomId}`, {
      state: {
        roomId: data.roomId,
        players: data.players,
        mode: data.mode,
        orientation: data.orientation,
      },
    })
  }

  const navigateToQueue = () => {
    navigate(`/game/queue/${gameMode}`, { state: { gameMode, id: auth.id } })
  }

  const handleGameModeChange = (mode) => {
    setGameMode(mode)
  }

  return (
    <main className="h-full">
      <HomePageHeader />
      <div className="w-full h-full items-center content-center justify-center grid">
        <ToggleGroup type="single" className="flex justify-center gap-20" value={gameMode}>
          <ToggleGroupItem
            value="bullet"
            className="h-max py-4 px-8 rounded-md"
            onClick={() => handleGameModeChange('bullet')}
          >
            <GameModeCard title="Bullet" image={rook} rank="A" elo="2500" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="blitz"
            className="h-max py-4 px-8 rounded-md"
            onClick={() => handleGameModeChange('blitz')}
          >
            <GameModeCard title="Blitz" image={queen} rank="B" elo="2100" />
          </ToggleGroupItem>
          <ToggleGroupItem
            onClick={() => handleGameModeChange('rapid')}
            value="rapid"
            className="h-max py-4 px-8 rounded-md"
          >
            <GameModeCard title="Rapid" image={pawn} rank="S" elo="1200" />
          </ToggleGroupItem>
        </ToggleGroup>
        <Button onClick={() => setStartGame(true)} className="text-2xl py-6 w-full mt-8" variant={'outline'}>
          {`Find ${gameMode} game`}
        </Button>
      </div>
      <HomePageFooter />
    </main>
  )
}

function GameModeCard({ title, image, rank, elo }) {
  return (
    <div>
      <h1 className="text-2xl text-center">{title}</h1>
      <img src={image} alt={title} className="size-32" />
      <div>
        <h1 className="text-xl text-center">
          Rank: <span>{rank}</span>
        </h1>
        <h1 className="text-xl text-center">
          Elo: <span>{elo}</span>
        </h1>
      </div>
    </div>
  )
}
