// @ts-nocheck

import FriendsBox from '@/components/FriendsBox'
import HomePageFooter from '@/components/HomePageFooter'
import HomePageHeader from '@/components/HomePageHeader'
import ProfilePageMain from '@/components/ProfilePageMain'

export default function ProfilePage() {
  return (
    <>
      <HomePageHeader />
      <FriendsBox />
      <ProfilePageMain />
      <HomePageFooter />
    </>
  )
}
