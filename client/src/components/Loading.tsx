// @ts-nocheck

import { ReloadIcon } from '@radix-ui/react-icons'
import loadinggif from '../assets/images/loading gif.webp'

export default function Loading() {
  return (
    <main className="inset-0 absolute z-50 bg-white flex items-center justify-center">
      <div className="grid gap-6">
        {/* <ReloadIcon className="animate-spin size-56" /> */}
        {/* <h1 className="text-center text-3xl">Loading...</h1> */}
        <img src={loadinggif} alt="loading" className="size-56" />
        <div className="dot-elastic"></div>
      </div>
    </main>
  )
}
