// @ts-nocheck

import { Button } from './ui/button'
import avatar from '../assets/avatar.jpg'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function HomePageFooter() {
  return (
    <footer className="absolute bottom-0 right-0 px-4 py-4 z-0 h-min">
      <div className="w-full justify-end items-center grid">
        <div className="grid items-center justify-items-center gap-2 border rounded py-4 px-4 cursor-pointer avatarCard">
          <Avatar className="size-12">
            <AvatarImage src={avatar} />
            <AvatarFallback>Name</AvatarFallback>
          </Avatar>
          <p>Nickname</p>
          <Button variant={'outline'}>Profile</Button>
        </div>
      </div>
    </footer>
  )
}
