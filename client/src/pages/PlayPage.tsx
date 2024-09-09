// @ts-nocheck

import HomePageFooter from '@/components/HomePageFooter'
import HomePageHeader from '@/components/HomePageHeader'
import PlayPageBoard from '@/components/PlayPageBoard'

export default function PlayPage() {
  return (
    <>
      <main className="w-full h-full">
        <HomePageHeader variant={'play'} />
        <PlayPageBoard />
        <HomePageFooter />
      </main>
    </>
  )
}
