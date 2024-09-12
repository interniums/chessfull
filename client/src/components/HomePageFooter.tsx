// @ts-nocheck

import { Button } from './ui/button'
import avatar from '../assets/avatar.svg'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useAuth from '@/hooks/useAuth'
import { Link } from 'react-router-dom'

export default function HomePageFooter() {
  const { auth, setAuth } = useAuth()

  return (
    <footer className="absolute bottom-0 right-0 px-4 py-4 z-0 h-min">
      <div className="w-full justify-end items-center grid">
        <div className="grid items-center justify-items-center gap-2 border rounded py-4 px-4 avatarCard">
          <Link to={`/profile/${auth?.id}`}>
            <Avatar className="size-12">
              <AvatarImage />
              <AvatarFallback>
                <div className="p-1.5">
                  <img src={avatar} alt="avatar" className="w-full" />
                </div>
              </AvatarFallback>
            </Avatar>
          </Link>
          <p>{auth?.username}</p>
          <Link to={`/profile/${auth?.id}`}>
            <Button variant={'outline'}>Profile</Button>
          </Link>
        </div>
      </div>
    </footer>
  )
}
