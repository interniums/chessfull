// @ts-nocheck

import { ReloadIcon } from '@radix-ui/react-icons'

export default function Loading() {
  return (
    <main className="inset-0 absolute z-50 bg-white flex items-center justify-center">
      <div className="grid gap-6">
        <ReloadIcon className="animate-spin size-56" />
        <h1 className="text-center text-3xl">Loading...</h1>
      </div>
    </main>
  )
}
