// @ts-nocheck

import FriendsBox from '@/components/FriendsBox'
import HomePageHeader from '@/components/HomePageHeader'
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
      <HomePageHeader />
      <HomePageMain />
      {globalState?.friendsOpen ? <FriendsBox /> : null}
    </>
  )
}
