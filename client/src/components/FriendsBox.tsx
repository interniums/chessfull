// @ts-nocheck

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Avatar, AvatarImage } from './ui/avatar'
import { ReloadIcon } from '@radix-ui/react-icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useGlobalContext } from '@/context/GlobalContext'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { useToast } from '@/hooks/use-toast'
import rank1 from '../assets/images/frame1.png'
import rank2 from '../assets/images/frame2.png'
import rank3 from '../assets/images/frame3.png'
import rank4 from '../assets/images/frame4.png'
import rank5 from '../assets/images/frame5.png'
import rank6 from '../assets/images/frame6.png'
import chat from '../assets/images/chat-round-unread-svgrepo-com.svg'
import remove from '../assets/images/remove-square-svgrepo-com.svg'
import reject from '../assets/images/delete-remove-uncheck-svgrepo-com.svg'
import accept from '../assets/images/accept-check-good-mark-ok-tick-svgrepo-com.svg'
import useAuth from '@/hooks/useAuth'

export default function FriendsBox() {
  const axiosPrivate = useAxiosPrivate()
  const { toast } = useToast()
  const { auth } = useAuth()
  const { globalState, setGlobalState } = useGlobalContext()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [friendsInfo, setFriendsInfo] = useState([])
  const [friendsInvites, setFriendsInvites] = useState([])
  const [forceUpdate, setForceUpdate] = useState(false)
  const [input, setInput] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResult, setSearchResult] = useState([])

  const dropDownRef = useRef(null)
  const dropDownRef2 = useRef(null)

  // Update global state when friendsOpen changes
  useEffect(() => {
    setGlobalState((prev) => ({ ...prev, friendsOpen: globalState.friendsOpen }))
  }, [globalState.friendsOpen, setGlobalState])

  // Fetch friends info
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    const getFriendsInfo = async () => {
      try {
        const response = await axiosPrivate.get(
          `https://chessfull-production.up.railway.app/user/${auth?.id}/getFriends`,
          {
            signal: controller.signal,
          }
        )
        setFriendsInfo(response?.data.userFriendsInfo || [])
        setFriendsInvites(response?.data.userInvitesInfo || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    getFriendsInfo()

    return () => {
      controller.abort()
    }
  }, [forceUpdate, auth?.id, axiosPrivate])

  // Handle image ranking display
  const getImg = (value) => {
    const ranks = [rank1, rank2, rank3, rank4, rank5, rank6]
    return ranks[value - 1] || rank1
  }

  // Navigate to user profile
  const navigateTo = (value) => {
    setGlobalState((prev) => ({ ...prev, friendsOpen: false }))
    navigate(`/socket/profile/${value}`)
  }

  // Remove friend
  const removeFriend = async (id, name) => {
    const controller = new AbortController()

    try {
      await axiosPrivate.post(`https://chessfull-production.up.railway.app/user/${auth.id}/removeFriend`, {
        signal: controller.signal,
        deleteId: id,
      })
      setFriendsInfo((prev) => prev.filter((friend) => friend.id !== id))
      toast({ title: 'Success', description: `User ${name} removed from friends` })
    } catch (err) {
      console.error(err)
    }
  }

  // Accept friend invite
  const acceptFriends = async (id, name) => {
    const controller = new AbortController()

    try {
      await axiosPrivate.post(`https://chessfull-production.up.railway.app/user/${auth.id}/acceptFriend`, {
        signal: controller.signal,
        acceptedId: id,
      })
      setForceUpdate((prev) => !prev)
      toast({ title: `You and ${name} are now friends` })
    } catch (err) {
      console.error(err)
    }
  }

  // Reject friend invite
  const rejectFriends = async (id) => {
    const controller = new AbortController()

    try {
      await axiosPrivate.post(`https://chessfull-production.up.railway.app/user/${auth.id}/rejectFriend`, {
        signal: controller.signal,
        rejectedId: id,
      })
      setFriendsInvites((prev) => prev.filter((invite) => invite.id !== id))
      toast({ title: 'Friend invite rejected' })
    } catch (err) {
      console.error(err)
    }
  }

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropDownRef.current &&
        dropDownRef2.current &&
        !dropDownRef.current.contains(event.target) &&
        !dropDownRef2.current.contains(event.target)
      ) {
        setSearchOpen(false)
      }
    }

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchOpen])

  // Search users debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (input) {
        searchUsers(input)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [input])

  // Fetch user search results
  const searchUsers = async (input) => {
    const controller = new AbortController()
    setSearchLoading(true)

    try {
      const response = await axiosPrivate.post(`https://chessfull-production.up.railway.app/user/userSearch`, {
        signal: controller.signal,
        input,
      })
      setSearchResult(response?.data || [])
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchResult([])
      }
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    if (searchResult[0]) {
      setSearchOpen(true)
    }
    if (!input) {
      setSearchOpen(false)
    }
  }, [searchResult, input])

  return (
    <Dialog
      open={globalState.friendsOpen}
      onOpenChange={() => {
        setGlobalState((prevState) => ({
          ...prevState,
          friendsOpen: !prevState.friendsOpen,
        }))
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Friends</DialogTitle>
          <DialogDescription style={{ textShadow: 'none' }} className="font-medium text-md">
            Make new friends and chat
          </DialogDescription>
          <div className="flex gap-4 items-center">
            <div className="relative w-full" ref={dropDownRef}>
              <input
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                className={`hover:bg-slate-100 w-full border py-2 px-3 cursor-pointer rounded-md outline-none font-medium text-md ${
                  searchOpen ? 'border-b-0' : ''
                }`}
                style={{
                  borderBottomLeftRadius: searchOpen ? '0px' : '6px',
                  borderBottomRightRadius: searchOpen ? '0px' : '6px',
                  textShadow: 'none',
                }}
                placeholder="Search for other players"
              />
              {searchOpen && (
                <div
                  ref={dropDownRef2}
                  className="absolute w-full bg-white border rounded-lg p-2 grid z-50 gap-2 border-t-0 max-h-40 transition-all ease-in-out h-min overflow-y-auto"
                  style={{
                    borderTopLeftRadius: '0px',
                    borderTopRightRadius: '0px',
                  }}
                >
                  <hr />
                  {searchResult?.map((item, index) => (
                    <div
                      className="hover:bg-slate-300 cursor-pointer p-2 flex items-center justify-between text-ellipsis rounded"
                      key={item._id || index}
                      onClick={() => navigateTo(item._id)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage title="account level" src={getImg(item.accountLevel)} />
                        </Avatar>
                        <div className="font-bold text-lg">{item.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <hr className="mt-2" />
        </DialogHeader>
        <Tabs defaultValue="friends">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="invites" className="relative">
              Invites{' '}
              {globalState?.newFriendInvite ? (
                <div className="absolute top-1 right-1   bg-red-500 w-2 h-2 rounded-full animate-pulse"></div>
              ) : null}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="friends" className="max-h-80 min-h-80 h-full overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center">
                <ReloadIcon className="w-12 h-12 animate-spin" />
              </div>
            ) : (
              friendsInfo?.map((friend, index) => (
                <div
                  className="hover:bg-slate-300 cursor-pointer p-2 flex items-center justify-between text-ellipsis rounded"
                  key={friend.id || index}
                  onClick={() => navigateTo(friend.id)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage title="account level" src={getImg(friend.accountLevel)} />
                    </Avatar>
                    <div className="font-bold text-lg">{friend.name}</div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <img
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('/socket/messages', {
                          state: {
                            createConversation: true,
                            createIdFromState: friend.id,
                            companionFromState: friend.id,
                          },
                        })
                        setGlobalState((prev) => ({ ...prev, friendsOpen: false }))
                        window.location.reload()
                      }}
                      src={chat}
                      alt="chat"
                      className="w-8 h-8 cursor-pointer hover:opacity-90"
                    />
                    <img
                      title="Remove friend"
                      src={remove}
                      className="w-8 h-8 cursor-pointer hover:opacity-90"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFriend(friend.id, friend.name)
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent value="invites" className="max-h-80 min-h-80 h-full overflow-y-auto">
            {friendsInvites?.map((invite, index) => (
              <div
                className="hover:bg-slate-300 cursor-pointer p-2 flex items-center justify-between text-ellipsis rounded"
                key={invite.id || index}
              >
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage title="account level" src={getImg(invite.accountLevel)} />
                  </Avatar>
                  <div className="font-medium">{invite.name}</div>
                </div>
                <div className="flex gap-2 items-center">
                  <img
                    title="Accept"
                    src={accept}
                    className="w-8 h-8 cursor-pointer hover:opacity-90"
                    onClick={() => {
                      acceptFriends(invite.id, invite.name)
                      setGlobalState((prev) => ({ ...prev, newFriendInvite: false }))
                    }}
                  />
                  <img
                    title="Reject"
                    src={reject}
                    className="w-8 h-8 cursor-pointer hover:opacity-90"
                    onClick={() => {
                      rejectFriends(invite.id)
                      setGlobalState((prev) => ({ ...prev, newFriendInvite: false }))
                    }}
                  />
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
