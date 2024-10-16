// @ts-nocheck

import HomePageFooter from './HomePageFooter'
import pawn from '../assets/images/pawn.png'
import queen from '../assets/images/queen.png'
import rook from '../assets/images/rook.png'
import rank1 from '../assets/images/frame1.png'
import rank2 from '../assets/images/frame2.png'
import rank3 from '../assets/images/frame3.png'
import rank4 from '../assets/images/frame4.png'
import rank5 from '../assets/images/frame5.png'
import rank6 from '../assets/images/frame6.png'
import loadinggif from '../assets/images/loading gif.webp'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { Avatar, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import useAuth from '@/hooks/useAuth'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { useToast } from '@/hooks/use-toast'
import { useGlobalContext } from '@/context/GlobalContext'
import { ReloadIcon } from '@radix-ui/react-icons'

export default function HomePageMain() {
  const TIME_TO_RECONNECT = 20000

  const { auth } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()
  const { globalState, setGlobalState } = useGlobalContext()
  const { state } = useLocation()
  const { showCreateGameDialogFromState } = state || false

  const [gameMode, setGameMode] = useState('')
  const [startGame, setStartGame] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showCreateGameDialog, setShowCreateGameDialog] = useState(showCreateGameDialogFromState || false)
  const [friendsInfo, setFriendsInfo] = useState([])
  const [inviteInfo, setInviteInfo] = useState({ from: auth?.id, to: '', gamemode: '', fromName: auth?.username })
  const [user, setUser] = useState({})
  const [sock] = useOutletContext()

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    const fetchData = async (url, setter) => {
      try {
        const response = await axiosPrivate.get(url, { signal: controller.signal })
        setter(response?.data)
      } catch (err) {
        console.error(err)
      }
    }

    const getFriendsInfo = () =>
      fetchData(`https://chessfull-production.up.railway.app/user/${auth?.id}/getFriends`, (data) =>
        setFriendsInfo(data.userFriendsInfo)
      )
    const getUserData = () =>
      fetchData(`https://chessfull-production.up.railway.app/user/${auth.id}`, (data) =>
        setUser({
          name: data.name,
          blitzElo: data.blitzElo,
          bulletElo: data.bulletElo,
          rapidElo: data.rapidElo,
        })
      )

    getFriendsInfo()
    getUserData()

    setLoading(false)
    return () => controller.abort()
  }, [auth.id])

  const handleGameModeChange = (mode) => setGameMode(mode)

  const handleSendInvite = () => {
    sock.emit('gameInvite', inviteInfo)
    setShowCreateGameDialog(false)
    toast({ title: 'Invite sent. Wait for response', duration: 2750 })
    setInviteInfo({ from: auth.id, to: '', gamemode: '', fromName: auth?.name })
  }

  useEffect(() => {
    if (gameMode.length > 1) {
      navigate(`/socket/game/queue/${gameMode}`, { state: { gameMode, id: auth.id } })
    }
  }, [startGame, gameMode, navigate, auth.id])

  const getRankImage = (value) => {
    const ranks = [rank1, rank2, rank3, rank4, rank5, rank6]
    return ranks[value - 1]
  }

  function GameModeCard({ title, image, elo }) {
    return (
      <div className="grid items-center justify-center">
        <div>
          <div className="text-2xl md:text-2xl lg:text-3xl text-center flex items-center justify-center">
            {loading ? (
              // <div className="animate-spin">
              //   <ReloadIcon className="size-7" />
              // </div>
              <div className="dot-elastic"></div>
            ) : (
              title
            )}
          </div>
        </div>
        <div className="w-full flex items-center justify-center">
          <img src={image} alt={title} className="size-24 md:size-28 lg:size-32 object-cover" />
        </div>
        <div>
          <div className="text-xl sm:text-xl md:text-2xl text-center font-medium flex items-center justify-center">
            {loading ? (
              <div className="animate-spin">
                <ReloadIcon className="size-7" />
              </div>
            ) : (
              // <div className="dot-elastic"></div>
              <div>
                Elo: <span>{elo}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="h-full w-full absolute flex items-center justify-center">
      {showCreateGameDialog && (
        <Dialog open={showCreateGameDialog} onOpenChange={() => setShowCreateGameDialog(!showCreateGameDialog)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create Game</DialogTitle>
              <DialogDescription className="font-medium">Choose game mode and opponent</DialogDescription>
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
                <h2 className="text-2xl font-bold">Select an opponent</h2>
                {friendsInfo.length === 0 ? (
                  <p className="font-meduim text-sm font-bold">
                    No friends available. Search for random opponents or play vs computer.
                  </p>
                ) : (
                  <Select onValueChange={(value) => setInviteInfo((prev) => ({ ...prev, to: value }))}>
                    <SelectTrigger className="font-medium">
                      <SelectValue placeholder="Choose friend to play" />
                    </SelectTrigger>
                    <SelectContent>
                      {friendsInfo.map((friend, index) => (
                        <SelectItem key={friend.id || index} value={friend.id}>
                          <div className="flex items-center justify-center gap-2">
                            <Avatar>
                              <AvatarImage title="account level" src={getRankImage(friend.accountLevel)} />
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
                variant={'outline'}
                className="w-full mt-4"
                disabled={!inviteInfo.to || !inviteInfo.gamemode}
                onClick={handleSendInvite}
              >
                Send Invite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <div className="w-full items-center content-center justify-center grid overflow-y-auto py-20 pt-22">
        <ToggleGroup type="single" value={gameMode} className="grid sm:flex justify-center md:gap-20">
          {['bullet', 'blitz', 'rapid'].map((mode, idx) => (
            <ToggleGroupItem
              className="h-max py-4 px-8 rounded-md font-bold"
              key={idx}
              value={mode}
              onClick={() => handleGameModeChange(mode)}
            >
              <GameModeCard
                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                image={mode === 'bullet' ? rook : mode === 'blitz' ? queen : pawn}
                elo={user[`${mode}Elo`]}
              />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button
          onClick={() => setShowCreateGameDialog(true)}
          className="text-2xl sm:text-xl md:text-2xl py-4 sm:py-5 md:py-6 w-full mt-4 font-bold"
          variant={'outline'}
        >
          Game with Friends
        </Button>
        <Button
          onClick={() => navigate('/socket/game/computer')}
          className="text-2xl sm:text-xl md:text-2xl py-4 sm:py-5 md:py-6 w-full mt-2 font-bold"
          variant={'outline'}
          disabled
          title="not available yet"
        >
          Play vs Computer
        </Button>
      </div>
      <HomePageFooter />
    </main>
  )
}
