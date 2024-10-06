// @ts-nocheck

import HomePageFooter from './HomePageFooter'
import HomePageHeader from './HomePageHeader'
import pawn from '../assets/images/pawn.png'
import queen from '../assets/images/queen.png'
import { io } from 'socket.io-client'
import rook from '../assets/images/rook.png'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Half1Icon, ReloadIcon } from '@radix-ui/react-icons'
import useAuth from '@/hooks/useAuth'
import rank1 from '../assets/images/frame1.png'
import rank2 from '../assets/images/frame2.png'
import rank3 from '../assets/images/frame3.png'
import rank4 from '../assets/images/frame4.png'
import rank5 from '../assets/images/frame5.png'
import rank6 from '../assets/images/frame6.png'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { axiosPrivate } from '@/api/axios'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from './ui/toast'
import { useGlobalContext } from '@/context/GlobalContext'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Avatar, AvatarImage } from './ui/avatar'

export default function HomePageMain({ socket }) {
  const TIME_TO_RECONNECT = 20000

  const { auth } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()
  const { globalState, setGlobalState } = useGlobalContext()

  const [gameMode, setGameMode] = useState('blitz')
  const [startGame, setStartGame] = useState(false)
  const [timeoutExpired, setTimeoutExpired] = useState(false)
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [showCreateGameDialog, setShowCreateGameDialog] = useState(false)
  const [friendsInfo, setFriendsInfo] = useState([{}])
  const [inviteInfo, setInviteInfo] = useState({
    from: auth.id,
    to: '',
    gamemode: '',
  })
  const [sock] = useOutletContext()
  const [newInvite, setNewInvite] = useState(false)

  useEffect(() => {
    setLoading(true)
    let isMounted = true
    const controller = new AbortController()

    const getFriendsInfo = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/user/${auth?.id}/getFriends`, {
          signal: controller.signal,
        })
        isMounted && setFriendsInfo(response?.data.userFriendsInfo)
        setLoading(false)
      } catch (err) {
        console.error(err)
      }
    }

    getFriendsInfo()

    return () => {
      setLoading(false)
      isMounted = false
      controller.abort()
    }
  }, [])

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

  const getImg = (value) => {
    if (value === 1) {
      return rank1
    }
    if (value === 2) {
      return rank2
    }
    if (value === 3) {
      return rank3
    }
    if (value === 4) {
      return rank4
    }
    if (value === 5) {
      return rank5
    }
    if (value === 6) {
      return rank6
    }
  }

  const handleSendInvite = () => {
    sock.emit('gameInvite', { to: inviteInfo.to, from: auth.id, gamemode: inviteInfo.gamemode })
    console.log('invite sent')
    setShowCreateGameDialog(false)
    toast({
      title: 'Invite sent. Wait for response',
    })
    setInviteInfo({})
  }

  const handleAcceptGameInvite = () => {}

  useEffect(() => {
    console.log('awdawd')
    if (globalState.gameInvite.gamemode.length && !newInvite) {
      setNewInvite(true)
    }
  }, [globalState])

  useEffect(() => {
    if (newInvite) {
      toast({
        title: 'New game invite',
        description: `User ${globalState?.gameInvite.name} invite you to play ${globalState?.gameInvite.gamemode}`,
        action: (
          <ToastAction altText="Accept" onClick={() => handleAcceptGameInvite()}>
            Accept
          </ToastAction>
        ),
      })
    }
  }, [newInvite])

  return (
    <main className="h-full w-full absolute">
      {showCreateGameDialog && (
        <Dialog open={showCreateGameDialog} onOpenChange={() => setShowCreateGameDialog(!showCreateGameDialog)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create game</DialogTitle>
              <DialogDescription className="font-medium">choose gamemode and opponent</DialogDescription>
            </DialogHeader>
            <div>
              <Select onValueChange={(value) => setInviteInfo((prev) => ({ ...prev, gamemode: value }))}>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder="select gamemode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="font-medium" value="bullet">
                    Bullet
                  </SelectItem>
                  <SelectItem className="font-medium" value="blitz">
                    Blitz
                  </SelectItem>
                  <SelectItem className="font-medium" value="rapid">
                    Rapid
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-4 grid items-center gap-2">
                <h1 className="text-2xl font-bold">Select an opponent</h1>
                {!friendsInfo.length ? (
                  <h1 className="font-meduim text-sm font-bold">
                    You have no friends to play with. Try to search for and random opponent or play vs computer
                  </h1>
                ) : (
                  <Select onValueChange={(value) => setInviteInfo((prev) => ({ ...prev, to: value }))}>
                    <SelectTrigger className="font-medium">
                      <SelectValue placeholder="Choose friend to play" />
                    </SelectTrigger>
                    <SelectContent>
                      {friendsInfo?.map((friend, index) => (
                        <SelectItem value={friend.id} key={friend.id || index}>
                          <div className="flex items-center justify-center gap-2">
                            <Avatar>
                              <AvatarImage title="account level" src={getImg(friend.accountLevel)}></AvatarImage>
                            </Avatar>
                            <div className="font-medium">{friend.name}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <Button
                disabled={!inviteInfo.to || !inviteInfo.gamemode ? true : false}
                variant={'outline'}
                className="w-full mt-4"
                onClick={() => handleSendInvite()}
              >
                Send invite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <HomePageHeader />
      <div className="w-full h-full items-center content-center justify-center grid">
        <ToggleGroup type="single" className="flex justify-center gap-20" value={gameMode}>
          <ToggleGroupItem
            value="bullet"
            className="h-max py-4 px-8 rounded-md font-bold"
            onClick={() => handleGameModeChange('bullet')}
          >
            <GameModeCard title="Bullet" image={rook} elo={user?.bulletElo} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="blitz"
            className="h-max py-4 px-8 rounded-md font-bold"
            onClick={() => handleGameModeChange('blitz')}
          >
            <GameModeCard title="Blitz" image={queen} elo={user?.blitzElo} />
          </ToggleGroupItem>
          <ToggleGroupItem
            onClick={() => handleGameModeChange('rapid')}
            value="rapid"
            className="h-max py-4 px-8 rounded-md font-bold"
          >
            <GameModeCard title="Rapid" image={pawn} elo={user?.rapidElo} />
          </ToggleGroupItem>
        </ToggleGroup>
        <Button onClick={() => setStartGame(true)} className="text-2xl py-6 w-full mt-8 font-bold" variant={'outline'}>
          {`Find ${gameMode} game`}
        </Button>
        <Button
          onClick={() => setShowCreateGameDialog(true)}
          className="text-2xl py-6 w-full mt-2 font-bold"
          variant={'outline'}
        >
          Game with friends
        </Button>
      </div>
      <HomePageFooter />
    </main>
  )
}

function GameModeCard({ title, image, elo }) {
  return (
    <div>
      <h1 className="text-2xl text-center">{title}</h1>
      <img src={image} alt={title} className="size-32" />
      <div>
        <h1 className="text-xl text-center font-medium">
          Elo: <span>{elo}</span>
        </h1>
      </div>
    </div>
  )
}
