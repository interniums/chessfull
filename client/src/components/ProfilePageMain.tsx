// @ts-nocheck

import { useEffect, useRef, useState } from 'react'
import rank1 from '../assets/images/frame1.png'
import rank2 from '../assets/images/frame2.png'
import rank3 from '../assets/images/frame3.png'
import rank4 from '../assets/images/frame4.png'
import rank5 from '../assets/images/frame5.png'
import rank6 from '../assets/images/frame6.png'
import avatar from '../assets/images/avatar.svg'
import pawn from '../assets/images/pawn.png'
import queen from '../assets/images/queen.png'
import plus from '../assets/images/add-friend-svgrepo-com.svg'
import rook from '../assets/images/rook.png'
import settings from '../assets/images/settings-svgrepo-com.svg'
import chat from '../assets/images/chat-round-unread-svgrepo-com.svg'
import stats from '../assets/images/stats-svgrepo-com.svg'
import mostWinsDueTo from '../assets/images/checkmate-svgrepo-com.svg'
import totalGames from '../assets/images/games-svgrepo-com.svg'
import joined from '../assets/images/group-svgrepo-com.svg'
import winrate from '../assets/images/win-svgrepo-com.svg'
import { axiosPrivate } from '@/api/axios'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import useAuth from '@/hooks/useAuth'
import { CheckIcon, Cross1Icon, Pencil1Icon, Pencil2Icon, PlusCircledIcon, ReloadIcon } from '@radix-ui/react-icons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { useLocation, useParams } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import ErrorInput from './InputError'
import ChangePasswordSettings from './ChangePasswordSettings'
import ChangeEmailSettings from './ChangeEmailSettings'
import ChangeUsernameSettings from './ChangeUsernameSettings'
import remove from '../assets/images/remove-square-svgrepo-com.svg'
import GameSettings from './GameSettings'

export default function ProfilePageMain() {
  const { id } = useParams()
  const { toast } = useToast()
  const axiosPrivate = useAxiosPrivate()
  const { auth } = useAuth()
  const [loading, setLoading] = useState(true)
  const [statsSelection, setStatsSelection] = useState('Blitz')
  const [playerStats, setPlayerStats] = useState({})
  const [isItUserProfile, setIsItUserProfile] = useState()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const [name, setName] = useState('')
  const [editName, setEditName] = useState(false)
  const [email, setEmail] = useState('')
  const [editEmail, setEditEmail] = useState(false)
  const [editPassword, setEditPassword] = useState(true)
  const [ifVisitorFriend, setIfVisitorFriend] = useState(false)
  const [ifFriendsInvites, setIfFriendsInvites] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(false)
  const [userPreferences, setUserPreferences] = useState({})
  const isFirstRender = useRef(true)

  useEffect(() => {
    setIsItUserProfile(auth.id === id ? true : false)
  }, [id])

  useEffect(() => {
    setLoading(true)
    let isMounted = true
    const controller = new AbortController()

    const getProfileStats = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/user/${id}/profile`, {
          signal: controller.signal,
        })
        isMounted && setPlayerStats(response.data)
        setName(response.data.name)
        setEmail(response.data.email)
        setLoading(false)
      } catch (err) {
        console.error(err)
      }
    }

    getProfileStats()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [id, forceUpdate])

  useEffect(() => {
    if (!loading) {
      if (playerStats?.friends.includes(auth.id)) {
        setIfVisitorFriend(true)
      } else {
        setIfVisitorFriend(false)
      }
      if (playerStats?.friendsInvites.includes(auth.id)) {
        setIfFriendsInvites(true)
      } else {
        setIfFriendsInvites(false)
      }
    }
  }, [playerStats])

  const removeFriend = async () => {
    let isMounted = true
    const controller = new AbortController()

    try {
      const response = await axiosPrivate.post(`http://localhost:3000/user/${auth.id}/removeFriend`, {
        signal: controller.signal,
        deleteId: id,
      })
      setForceUpdate(!forceUpdate)
      toast({
        title: 'Success',
        description: `User ${name} removed from friends`,
      })
    } catch (err) {
      console.error(err)
    }

    return () => {
      isMounted = false
      controller.abort()
    }
  }

  const addFriend = async () => {
    let isMounted = true
    const controller = new AbortController()

    try {
      const response = await axiosPrivate.post(`http://localhost:3000/user/${auth.id}/addFriend`, {
        signal: controller.signal,
        friendId: id,
      })
      if (response.status === 200) {
        toast({
          title: 'Success',
          description: `Friends invite sent`,
        })
      }
    } catch (err) {
      console.error(err)
    }

    return () => {
      isMounted = false
      controller.abort()
    }
  }

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const updateUserPreferences = async () => {
      try {
        const response = await axiosPrivate.patch(`http://localhost:3000/user/update/preferences`, {
          signal: controller.signal,
          pieceSpeedAnimation: userPreferences?.pieceSpeedAnimation,
          pieceMoveType: userPreferences?.pieceMoveType,
          premovesAllowed: userPreferences?.premovesAllowed,
          queenPromotion: userPreferences?.queenPromotion,
          pieceSet: userPreferences?.pieceSet,
          board: userPreferences?.board,
          id: auth.id,
        })

        console.log('user preferences updated')
      } catch (err) {
        console.error(err)
      }
    }

    // Prevent function call on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      updateUserPreferences()
    }

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [userPreferences])

  // get user preferences
  useEffect(() => {
    setLoading(true)
    let isMounted = true
    const controller = new AbortController()

    const getUserPreferences = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/user/${auth?.id}/getPreferences`, {
          signal: controller.signal,
        })
        isMounted && setUserPreferences(response.data)
      } catch (err) {
        console.error(err)
      }
    }

    getUserPreferences()

    return () => {
      isMounted = false
      controller.abort()
      setLoading(false)
    }
  }, [])

  return (
    <div className="w-full h-full py-24 px-12">
      {loading ? (
        <main className="inset-0 absolute z-50 bg-white flex items-center justify-center">
          <div className="grid gap-6">
            <ReloadIcon className="animate-spin size-56" />
            <h1 className="text-center text-3xl">Loading...</h1>
          </div>
        </main>
      ) : (
        <>
          <header className="w-full flex items-center justify-center">
            <div className="flex items-center justify-start w-full">
              <div className="grid items-center justify-center p-4 gap-8 w-full">
                <div className="flex items-center justify-center w-full">
                  <div className="flex items-end justify-centers text-4xl text-center gap-3">
                    <div>{playerStats?.name}</div>
                    {!isItUserProfile ? (
                      <>
                        {!ifVisitorFriend ? (
                          <div
                            onClick={() => {
                              !ifFriendsInvites
                                ? addFriend()
                                : toast({
                                    title: 'Friends invite already sent',
                                  })
                            }}
                            className={
                              !ifFriendsInvites
                                ? 'hover:scale-105 transition-transform cursor-pointer active:scale-90'
                                : 'transition-transform cursor-pointer animate-pulse'
                            }
                          >
                            <img
                              src={plus}
                              className="size-9"
                              alt="add friend"
                              title={!ifFriendsInvites ? 'add friend' : 'friends invite already sent'}
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => removeFriend()}
                            className="hover:scale-105 transition-transform cursor-pointer active:scale-90"
                          >
                            <img className="size-9" src={remove} title="remove from friednds" alt="remove" />
                          </div>
                        )}
                        <div className="hover:scale-105 transition-transform cursor-pointer active:scale-90">
                          <img src={chat} className="size-9" alt="chat" title="send message" />
                        </div>
                      </>
                    ) : null}
                    {isItUserProfile ? (
                      <div
                        className="hover:scale-105 transition-transform cursor-pointer active:scale-90"
                        onClick={() => setSettingsOpen(true)}
                      >
                        <img src={settings} className="size-9" alt="settings" title="send message" />
                      </div>
                    ) : null}
                    {settingsOpen ? (
                      <div>
                        <Dialog open={settingsOpen} onOpenChange={() => setSettingsOpen(false)}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="text-3xl font-bold">User settings</DialogTitle>
                              <DialogDescription className="text-sm font-medium">
                                change settings here
                              </DialogDescription>
                            </DialogHeader>
                            <div className="w-full">
                              <Tabs defaultValue="account">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="account">Account</TabsTrigger>
                                  <TabsTrigger value="game">Game</TabsTrigger>
                                </TabsList>
                                <TabsContent value="account" className="shadow-md rounded-xl p-4">
                                  <div className="grid py-2 gap-6 w-full">
                                    <div>
                                      <h1 className="font-bold">Account settings</h1>
                                      <p className="text-sm font-medium text-muted-foreground">
                                        change account settings here
                                      </p>
                                    </div>
                                    <div className="flex gap-8 items-end w-full">
                                      <ChangeUsernameSettings
                                        name={name}
                                        setName={setName}
                                        editName={editName}
                                        setEditName={setEditName}
                                        id={id}
                                      />
                                    </div>
                                    <div className="flex gap-8 items-end w-full">
                                      <ChangeEmailSettings
                                        editEmail={editEmail}
                                        setEditEmail={setEditEmail}
                                        email={email}
                                        id={id}
                                        setEmail={setEmail}
                                      />
                                    </div>
                                    <div className="flex gap-8 items-end w-full">
                                      <ChangePasswordSettings editPassword={true} id={id} />
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="game" className="shadow-md rounded-xl p-4 min-h-80 overflow-y-auto">
                                  <GameSettings
                                    userPreferences={userPreferences}
                                    setUserPreferences={setUserPreferences}
                                  />
                                </TabsContent>
                              </Tabs>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-12 items-start justify-center w-full">
                  <div className="grid items-center justify-center">
                    <div className="flex items-center justify-center">
                      <img className="size-12" src={joined} alt="joined" title="joined" />
                    </div>
                    <div className="text-center text-xl">{playerStats?.joined}</div>
                  </div>
                  <div className="grid items-center justify-center">
                    <div className="flex items-center justify-center">
                      <img src={totalGames} alt="total" className="size-12" title="total games" />
                    </div>
                    <div className="text-center text-xl">{playerStats?.gamesPlayed}</div>
                  </div>
                  <div className="grid items-center justify-center">
                    <div className="flex items-center justify-center">
                      <img src={winrate} alt="winrate" className="size-12" title="winrate" />
                    </div>
                    <div className="text-center text-xl">{playerStats?.winPrecentage}%</div>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="grid w-full items-center justify-center p-10">
            <div className="w-full h-full grid gap-8 bg-slate-100 rounded-2xl py-6 px-20 shadow-md items-center justify-center">
              <div className="w-full flex items-center justify-center">
                <Select onValueChange={setStatsSelection}>
                  <SelectTrigger>
                    <SelectValue placeholder={statsSelection} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bullet">Bullet</SelectItem>
                    <SelectItem value="Blitz">Blitz</SelectItem>
                    <SelectItem value="Rapid">Rapid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid items-center justify-center">
                <div className="flex items-center justify-center mb-4">
                  <img
                    className="size-36"
                    src={
                      statsSelection === 'Bullet'
                        ? rook
                        : statsSelection === 'Blitz'
                        ? queen
                        : statsSelection === 'Rapid'
                        ? pawn
                        : null
                    }
                    alt="piece"
                    title="gamemode"
                  />
                </div>
                <div className="flex items-center justify-center gap-10 mt-10">
                  <div className="grid items-center justify-center gap-2">
                    <p className="text-2xl text-center">Total games</p>
                    <p className="text-center text-xl">
                      {statsSelection == 'Blitz'
                        ? playerStats?.blitzGames
                        : statsSelection == 'Bullet'
                        ? playerStats?.bulletGames
                        : statsSelection == 'Rapid'
                        ? playerStats?.rapidGames
                        : null}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-10 mt-10">
                  <div className="flex items-center justify-center gap-4">
                    <img src={winrate} alt="winrate" title="winrate" className="size-10" />
                    <p className="text-center text-xl">
                      {' '}
                      {statsSelection == 'Blitz'
                        ? playerStats?.blitzWinPrecentage + '%'
                        : statsSelection == 'Bullet'
                        ? playerStats?.bulletWinPrecentage + '%'
                        : statsSelection == 'Rapid'
                        ? playerStats?.rapidWinPrecentage + '%'
                        : null}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <img src={stats} alt="winrate" title="elo" className="size-10" />
                    <p className="text-center text-xl">
                      {statsSelection == 'Blitz'
                        ? playerStats?.blitzElo
                        : statsSelection == 'Bullet'
                        ? playerStats?.bulletElo
                        : statsSelection == 'Rapid'
                        ? playerStats?.rapidElo
                        : null}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  )
}
