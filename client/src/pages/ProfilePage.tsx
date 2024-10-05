// @ts-nocheck

import FriendsBox from '@/components/FriendsBox'
import HomePageFooter from '@/components/HomePageFooter'
import HomePageHeader from '@/components/HomePageHeader'
import ProfilePageMain from '@/components/ProfilePageMain'
import { useGlobalContext } from '@/context/GlobalContext'
import { useState } from 'react'

export default function ProfilePage() {
  const { globalState, setGlobalState } = useGlobalContext()

  return (
    <>
      <HomePageHeader />
      {globalState?.friendsOpen ? <FriendsBox /> : null}
      <ProfilePageMain />
      <HomePageFooter />
    </>
  )
}
