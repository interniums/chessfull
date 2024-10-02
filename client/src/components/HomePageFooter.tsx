// @ts-nocheck

import { Button } from './ui/button'
import avatar from '../assets/avatar.svg'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

import rank1 from '../assets/frame1.png'
import rank2 from '../assets/frame2.png'
import rank3 from '../assets/frame3.png'
import rank4 from '../assets/frame4.png'
import rank5 from '../assets/frame5.png'
import rank6 from '../assets/frame6.png'
import { axiosPrivate } from '@/api/axios'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'

export default function HomePageFooter() {
  const { auth, setAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [accountLevel, setAccountLevel] = useState(0)
  const [rankAvatar, setRankAvatar] = useState(rank1)
  const axiosPrivate = useAxiosPrivate()

  useEffect(() => {
    setLoading(true)
    let isMounted = true
    const controller = new AbortController()

    const getUserLevel = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/user/${auth?.id}`, {
          signal: controller.signal,
        })
        console.log(response)
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
    <footer className="absolute bottom-0 left-0 px-4 py-4 z-0 h-min">
      <div className="w-full justify-end items-center grid">
        <div className="grid items-center justify-items-center gap-2 border rounded py-4 px-4 avatarCard shadow-md">
          <Link to={`/profile/${auth?.id}`}>
            <Avatar className="size-12">
              <AvatarImage />
              <AvatarFallback>
                <div className="">
                  <img src={loading ? avatar : rankAvatar} alt="avatar" className="w-full" />
                </div>
              </AvatarFallback>
            </Avatar>
          </Link>
          <p>{auth?.username}</p>
          <Link to={`/profile/${auth?.id}`} className="w-full">
            <Button className="w-full" variant={'outline'}>
              Profile
            </Button>
          </Link>
          <Button className="w-full" variant={'outline'}>
            Friends
          </Button>
        </div>
      </div>
    </footer>
  )
}
