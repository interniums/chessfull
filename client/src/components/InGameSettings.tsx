// @ts-nocheck

import { Cross1Icon, GearIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { axiosPrivate } from '@/api/axios'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import useAuth from '@/hooks/useAuth'

export default function InGameSettings({ userPreferences, setUserPreferences }) {
  const axiosPrivate = useAxiosPrivate()
  const { auth } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center justify-center">
      <GearIcon className="size-7 cursor-pointer p-1 hover:bg-slate-300 rounded-md" onClick={() => setOpen(!open)} />
      {open && (
        <div className="absolute inset-0 z-40 flex justify-center items-center">
          <div className="rounded-md py-6 px-10 border bg-white relative">
            <div className="absolute right-3 top-3" onClick={() => setOpen(false)}>
              <Cross1Icon className="size-9 hover:bg-slate-200 cursor-pointer p-2 rounded-lg" />
            </div>
            <h1 className="text-2xl mb-6">Settings</h1>
            <div className="py-2 px-2 flex gap-8 items-center justify-center">
              <div className="grid gap-8 items-start justify-center">
                <div className="text-l text-start">Piece animation</div>
                <div className="text-l text-start">Piece move method</div>
                <div className="text-l text-start">Allow premoves</div>
                <div className="text-l text-start">Always promote to queen</div>
              </div>
              <div className="grid gap-5 items-center justify-center">
                <div className="speedAnimation flex gap-4 items-center justify-center">
                  <Select
                    value={userPreferences?.pieceSpeedAnimation}
                    onValueChange={(value) => setUserPreferences((prev) => ({ ...prev, pieceSpeedAnimation: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={userPreferences?.pieceSpeedAnimation} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={600}>Slow</SelectItem>
                      <SelectItem value={300}>Default</SelectItem>
                      <SelectItem value={150}>Fast</SelectItem>
                      <SelectItem value={0}>None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="moveType flex gap-4 items-center justify-center">
                  <Select
                    value={userPreferences?.pieceMoveType}
                    onValueChange={(value) => setUserPreferences((prev) => ({ ...prev, pieceMoveType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={userPreferences?.pieceMoveType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={1}>Both click and drag & drop</SelectItem>
                      <SelectItem value={2}>Only click</SelectItem>
                      <SelectItem value={3}>Only drag and drop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="moveType flex gap-4 items-center justify-center">
                  <Select
                    value={userPreferences?.premovesAllowed}
                    onValueChange={(value) => setUserPreferences((prev) => ({ ...prev, premovesAllowed: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={userPreferences?.premovesAllowed} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={true}>Premoves allowed</SelectItem>
                      <SelectItem value={false}>Premoves not allowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="moveType flex gap-4 items-center justify-center">
                  <Select
                    value={userPreferences?.queenPromotion}
                    onValueChange={(value) => setUserPreferences((prev) => ({ ...prev, queenPromotion: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={userPreferences?.queenPromotion} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={true}>True</SelectItem>
                      <SelectItem value={false}>False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
