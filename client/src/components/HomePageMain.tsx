// @ts-nocheck

import HomePageFooter from './HomePageFooter'
import HomePageHeader from './HomePageHeader'
import pawn from '../assets/images/pawn.png'
import queen from '../assets/images/queen.png'
import rook from '../assets/images/rook.png'
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
  const TIER_S = 2000
  const TIER_A = 1500
  const TIER_B = 1200
  const TIER_C = 950
  const TIER_D = 600
  const TBD = 599

  const getRank = (value) => {
    if (value > TIER_S) {
      return 'S'
    } else if (value > TIER_A) {
      return 'A'
    } else if (value > TIER_B) {
      return 'B'
    } else if (value > TIER_C) {
      return 'C'
    } else if (value > TIER_D) {
      return 'D'
    } else if (value < TBD) {
      return 'TBD'
    }
  }

  const { auth } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [gameMode, setGameMode] = useState('blitz')
  const [startGame, setStartGame] = useState(false)
  const [timeoutExpired, setTimeoutExpired] = useState(false)
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const getUserData = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/user/${auth.id}`, {
          signal: controller.signal,
        })
        setUser({
          name: response.data.name,
          blitzElo: response.data.blitzElo,
          bulletElo: response.data.bulletElo,
          rapidElo: response.data.rapidElo,
        })
      } catch (err) {
        console.error(err)
      }
    }
    getUserData()

    return () => {
      controller.abort()
    }
  }, [])

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
        if (response.status === 100) {
          console.log('no game to reconnect')
          return
        }
      } catch (err) {
        console.error(err)
      }
    }
    checkForReconnect()

    return () => {
      controller.abort()
      setLoading(false)
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
    navigate(`/socket/game/${data.roomId}`, {
      state: {
        roomId: data.roomId,
        players: data.players,
        mode: data.mode,
        orientation: data.orientation,
      },
    })
  }

  const navigateToQueue = () => {
    navigate(`/socket/game/queue/${gameMode}`, { state: { gameMode, id: auth.id } })
  }

  const handleGameModeChange = (mode) => {
    setGameMode(mode)
  }

  return (
    <main className="h-full w-full absolute">
      <HomePageHeader />
      <div className="w-full h-full items-center content-center justify-center grid">
        <ToggleGroup type="single" className="flex justify-center gap-20" value={gameMode}>
          <ToggleGroupItem
            value="bullet"
            className="h-max py-4 px-8 rounded-md font-bold"
            onClick={() => handleGameModeChange('bullet')}
          >
            <GameModeCard title="Bullet" image={rook} rank={getRank(user?.bulletElo)} elo={user?.bulletElo} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="blitz"
            className="h-max py-4 px-8 rounded-md font-bold"
            onClick={() => handleGameModeChange('blitz')}
          >
            <GameModeCard title="Blitz" image={queen} rank={getRank(user?.blitzElo)} elo={user?.blitzElo} />
          </ToggleGroupItem>
          <ToggleGroupItem
            onClick={() => handleGameModeChange('rapid')}
            value="rapid"
            className="h-max py-4 px-8 rounded-md font-bold"
          >
            <GameModeCard title="Rapid" image={pawn} rank={getRank(user?.rapidElo)} elo={user?.rapidElo} />
          </ToggleGroupItem>
        </ToggleGroup>
        <Button onClick={() => setStartGame(true)} className="text-2xl py-6 w-full mt-8 font-bold" variant={'outline'}>
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
        <h1 className="text-xl text-center font-medium">
          Rank: <span>{rank}</span>
        </h1>
        <h1 className="text-xl text-center font-medium">
          Elo: <span>{elo}</span>
        </h1>
      </div>
    </div>
  )
}
