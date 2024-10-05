// @ts-nocheck

import { axiosPrivate } from '@/api/axios'
import useAuth from '@/hooks/useAuth'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { useGlobalContext } from '@/context/GlobalContext'
import { Avatar, AvatarImage } from './ui/avatar'
import { ReloadIcon } from '@radix-ui/react-icons'
import rank1 from '../assets/images/frame1.png'
import rank2 from '../assets/images/frame2.png'
import rank3 from '../assets/images/frame3.png'
import rank4 from '../assets/images/frame4.png'
import rank5 from '../assets/images/frame5.png'
import rank6 from '../assets/images/frame6.png'
import { Link, useNavigate, useParams } from 'react-router-dom'
import chat from '../assets/images/chat-round-unread-svgrepo-com.svg'
import plus from '../assets/images/plus-square-svgrepo-com.svg'
import cancel from '../assets/images/cancel-presentation-svgrepo-com.svg'
import remove from '../assets/images/remove-square-svgrepo-com.svg'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import reject from '../assets/images/delete-remove-uncheck-svgrepo-com.svg'
import accept from '../assets/images/accept-check-good-mark-ok-tick-svgrepo-com.svg'

export default function FriendsBox() {
  const axiosPrivate = useAxiosPrivate()
  const { toast } = useToast()
  const { auth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [friendsInfo, setFriendsInfo] = useState([{}])
  const { globalState, setGlobalState } = useGlobalContext()
  const [friendsOpen, setFriendsOpen] = useState(globalState.friendsOpen)
  const [friendsInvites, setFriendsInvites] = useState([])
  const [forceUpdate, setForceUpdate] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setGlobalState((prev) => ({ ...prev, friendsOpen: friendsOpen }))
  }, [friendsOpen])

  console.log(friendsInvites)

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
        setFriendsInvites(response?.data.userInvitesInfo)
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
  }, [forceUpdate])

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

  const navigateTo = (value) => {
    setGlobalState((prev) => ({ ...prev, friendsOpen: false }))
    navigate(`/socket/profile/${value}`)
  }

  const removeFriend = async (id, name) => {
    let isMounted = true
    const controller = new AbortController()

    try {
      const response = await axiosPrivate.post(`http://localhost:3000/user/${auth.id}/removeFriend`, {
        signal: controller.signal,
        deleteId: id,
      })
      setFriendsInfo((prev) => prev.filter((friend) => friend.id !== id))
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

  const acceptFriends = async (id, name) => {
    let isMounted = true
    const controller = new AbortController()

    try {
      const response = await axiosPrivate.post(`http://localhost:3000/user/${auth.id}/acceptFriend`, {
        signal: controller.signal,
        acceptedId: id,
      })
      setForceUpdate(!forceUpdate)
      toast({
        title: `You and ${name} are now friends`,
      })
    } catch (err) {
      console.error(err)
    }

    return () => {
      isMounted = false
      controller.abort()
    }
  }

  const rejectFriends = async (id) => {
    let isMounted = true
    const controller = new AbortController()

    try {
      const response = await axiosPrivate.post(`http://localhost:3000/user/${auth.id}/rejectFriend`, {
        signal: controller.signal,
        rejectedId: id,
      })
      setFriendsInvites(friendsInvites.filter((item) => item.id !== id))
      toast({
        title: `Friend invite rejected`,
      })
    } catch (err) {
      console.error(err)
    }

    return () => {
      isMounted = false
      controller.abort()
    }
  }

  return (
    <Dialog open={friendsOpen} onOpenChange={setFriendsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Friends</DialogTitle>
          <DialogDescription className="font-medium">make new friends and chat</DialogDescription>
          <div>
            <hr className="mt-2" />
          </div>
        </DialogHeader>
        {loading ? (
          <div className="max-h-80 min-h-80 grid items-center justify-center w-full">
            <ReloadIcon className="animate-spin size-44" />
            <h1 className="text-center text-3xl">Loading...</h1>
          </div>
        ) : (
          <div>
            <Tabs defaultValue="friends">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="friends">Friends</TabsTrigger>
                <TabsTrigger value="invites">Invites</TabsTrigger>
              </TabsList>
              <TabsContent value="friends">
                <div className="max-h-80 min-h-80 overflow-y-auto pr-2 mt-4">
                  {friendsInfo?.map((friend, index) => (
                    <div
                      className="hover:bg-slate-300 cursor-pointer p-2 flex items-center justify-between text-ellipsis rounded"
                      key={friend.id || index}
                      onClick={() => navigateTo(friend.id)}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Avatar>
                          <AvatarImage title="account level" src={getImg(friend.accountLevel)}></AvatarImage>
                        </Avatar>
                        <div className="font-medium">{friend.name}</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFriend(friend.id, friend.name)
                          }}
                          className="p-1 hover:scale-110"
                        >
                          <img className="size-7" src={remove} title="remove from friednds" alt="remove" />
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="p-1 hover:scale-110"
                        >
                          <img className="size-7" src={plus} alt="invite" title="invite to game" />
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="p-1 hover:scale-110"
                        >
                          <img className="size-7" src={chat} title="write a message" alt="chat" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="invites">
                <div className="max-h-80 min-h-80 overflow-y-auto pr-2 mt-4">
                  {friendsInvites?.map((friend, index) => (
                    <div
                      className="hover:bg-slate-300 cursor-pointer p-2 flex items-center justify-between text-ellipsis rounded"
                      key={friend.id || index}
                      onClick={() => navigateTo(friend.id)}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Avatar>
                          <AvatarImage title="account level" src={getImg(friend.accountLevel)}></AvatarImage>
                        </Avatar>
                        <div className="font-medium">{friend.name}</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            acceptFriends(friend.id, friend.name)
                          }}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <img className="size-7" src={accept} alt="accept" title="accept friends invitation" />
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            rejectFriends(friend.id)
                          }}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <img className="size-7" src={reject} title="reject friends invitation" alt="reject" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
