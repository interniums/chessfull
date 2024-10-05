// @ts-nocheck

import FriendsBox from '@/components/FriendsBox'
import HomePageMain from '@/components/HomePageMain'
import { useGlobalContext } from '@/context/GlobalContext'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { globalState, setGlobalState } = useGlobalContext()
  const [friendsOpen, setFriendsOpen] = useState(globalState.friendsOpen)

  useEffect(() => {
    setFriendsOpen(globalState.friendsOpen)
  }, [globalState])

  return (
    <>
      <HomePageMain />
      {globalState?.friendsOpen ? <FriendsBox /> : null}
    </>
  )
}
