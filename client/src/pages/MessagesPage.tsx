// @ts-nocheck

import FriendsBox from '@/components/FriendsBox'
import HomePageFooter from '@/components/HomePageFooter'
import HomePageHeader from '@/components/HomePageHeader'
import MessagesMain from '@/components/MessagesMain'
import { useGlobalContext } from '@/context/GlobalContext'

export default function MessagesPage() {
  const { globalState, setGlobalState } = useGlobalContext()
  return (
    <>
      <HomePageHeader />
      <MessagesMain />
      {globalState?.friendsOpen ? <FriendsBox /> : null}
      <HomePageFooter />
    </>
  )
}
