// @ts-nocheck

import { Button } from './ui/button'
import avatar from '../assets/images/avatar.svg'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

import rank1 from '../assets/images/frame1.png'
import rank2 from '../assets/images/frame2.png'
import rank3 from '../assets/images/frame3.png'
import rank4 from '../assets/images/frame4.png'
import rank5 from '../assets/images/frame5.png'
import rank6 from '../assets/images/frame6.png'
import { axiosPrivate } from '@/api/axios'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import FriendsBox from './FriendsBox'
import { useGlobalContext } from '@/context/GlobalContext'

export default function HomePageFooter() {
  const { auth, setAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [accountLevel, setAccountLevel] = useState(0)
  const [rankAvatar, setRankAvatar] = useState(rank1)
  const axiosPrivate = useAxiosPrivate()
  const { globalState, setGlobalState } = useGlobalContext()
  const [friendsOpen, setFriendsOpen] = useState(globalState.friendsOpen)
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    setFriendsOpen(globalState.friendsOpen)
  }, [globalState])

  useEffect(() => {
    setLoading(true)
    let isMounted = true
    const controller = new AbortController()

    const getUserLevel = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/user/${auth?.id}`, {
          signal: controller.signal,
        })
        isMounted && setAccountLevel(response?.data.accountLevel)
        setLoading(false)
      } catch (err) {
        console.error(err)
      }
    }

    getUserLevel()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (accountLevel == 1) {
      setRankAvatar(rank1)
    }
    if (accountLevel == 2) {
      setRankAvatar(rank2)
    }
    if (accountLevel == 3) {
      setRankAvatar(rank3)
    }
    if (accountLevel == 4) {
      setRankAvatar(rank4)
    }
    if (accountLevel == 5) {
      setRankAvatar(rank5)
    }
    if (accountLevel == 6) {
      setRankAvatar(rank6)
    }
  }, [accountLevel])

  return (
    <footer className="absolute bottom-0 left-0 px-4 py-4 z-50 h-min transition-all">
      {isSmallScreen ? null : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full justify-end items-center grid bg-white"
        >
          <div className="grid items-center justify-items-center gap-2 border rounded py-4 px-8 avatarCard shadow-md">
            <Link to={`/socket/profile/${auth?.id}`}>
              <Avatar className="size-12">
                <AvatarImage />
                <AvatarFallback>
                  <div className="">
                    <img src={loading ? avatar : rankAvatar} alt="avatar" className="w-full" />
                  </div>
                </AvatarFallback>
              </Avatar>
            </Link>
            <p className="font-bold text-lg">{auth?.username}</p>
            <Link to={`/socket/profile/${auth?.id}`} className="w-full">
              <Button className="w-full" variant={'outline'}>
                Profile
              </Button>
            </Link>
            <Button
              onClick={() => setGlobalState((prev) => ({ ...prev, friendsOpen: !friendsOpen }))}
              className="w-full relative"
              variant={'outline'}
            >
              {globalState?.newFriendInvite ? (
                <div className="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full animate-pulse"></div>
              ) : null}
              Friends
            </Button>
          </div>
        </motion.div>
      )}
    </footer>
  )
}
