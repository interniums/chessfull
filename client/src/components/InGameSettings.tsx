// @ts-nocheck

import { Cross1Icon, GearIcon } from '@radix-ui/react-icons'
import { useEffect, useMemo, useState } from 'react'
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
      <GearIcon className="size-8 cursor-pointer p-1 hover:bg-slate-300 rounded-md" onClick={() => setOpen(!open)} />
      {open && (
        <div className="absolute inset-0 z-40 flex justify-center items-center">
          <div className="rounded-md py-6 px-10 border bg-white relative">
            <div className="absolute right-3 top-3" onClick={() => setOpen(false)}>
              <Cross1Icon className="size-9 hover:bg-slate-200 cursor-pointer p-2 rounded-lg" />
            </div>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <div className="py-2 px-2 flex gap-8 items-center justify-center">
              <div className="grid gap-8 items-start justify-center">
                <div className="text-lg text-start">Piece animation</div>
                <div className="text-lg text-start">Piece move method</div>
                <div className="text-lg text-start">Allow premoves</div>
                <div className="text-lg text-start">Always promote to queen</div>
                <div className="text-lg text-start">Choose piece set</div>
                <div className="text-lg text-start">Choose board</div>
              </div>
              <div className="grid gap-6 items-center justify-center">
                <div className="speedAnimation flex gap-4 items-center justify-center">
                  <Select
                    value={userPreferences?.pieceSpeedAnimation}
                    onValueChange={(value) => {
                      setUserPreferences((prev) => ({ ...prev, pieceSpeedAnimation: value }))
                    }}
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
                    onValueChange={(value) => {
                      setUserPreferences((prev) => ({ ...prev, pieceMoveType: value }))
                    }}
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
                    onValueChange={(value) => {
                      setUserPreferences((prev) => ({ ...prev, premovesAllowed: value }))
                    }}
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
                    onValueChange={(value) => {
                      setUserPreferences((prev) => ({ ...prev, queenPromotion: value }))
                    }}
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
                <div className="moveType flex gap-4 items-center justify-center">
                  <Select
                    value={userPreferences?.pieceSet}
                    onValueChange={(value) => {
                      setUserPreferences((prev) => ({ ...prev, pieceSet: value }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={userPreferences?.pieceSet} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={'alpha'}>alpha</SelectItem>
                      <SelectItem value={'caliente'}>caliente</SelectItem>
                      <SelectItem value={'cardinal'}>cardinal</SelectItem>
                      <SelectItem value={'cburnett'}>cburnett</SelectItem>
                      <SelectItem value={'chessnut'}>chessnut</SelectItem>
                      <SelectItem value={'cooke'}>cooke</SelectItem>
                      <SelectItem value={'gioco'}>gioco</SelectItem>
                      <SelectItem value={'governor'}>governor</SelectItem>
                      <SelectItem value={'icpieces'}>icpieces</SelectItem>
                      <SelectItem value={'kiwen-suwi'}>kiwen-suwi</SelectItem>
                      <SelectItem value={'kosal'}>kosal</SelectItem>
                      <SelectItem value={'maestro'}>maestro</SelectItem>
                      <SelectItem value={'merida'}>merida</SelectItem>
                      <SelectItem value={'monarchy'}>monarchy</SelectItem>
                      <SelectItem value={'mpchess'}>mpchess</SelectItem>
                      <SelectItem value={'pirouetti'}>pirouetti</SelectItem>
                      <SelectItem value={'pixel'}>pixel</SelectItem>
                      <SelectItem value={'staunty'}>staunty</SelectItem>
                      <SelectItem value={'tatiana'}>tatiana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="moveType flex gap-4 items-center justify-center">
                  <Select
                    value={userPreferences?.board}
                    onValueChange={(value) => {
                      setUserPreferences((prev) => ({
                        ...prev,
                        board: value,
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue>{userPreferences?.board.name}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={{ lightSquare: '#eeeed2', darkSquare: '#769656', name: 'Green' }}>
                        Green
                      </SelectItem>
                      <SelectItem value={{ lightSquare: '#d2b48c', darkSquare: '#654321', name: 'Dark Wood' }}>
                        Dark Wood
                      </SelectItem>
                      <SelectItem value={{ lightSquare: '#f7deab', darkSquare: '#b58863', name: 'Brown' }}>
                        Brown
                      </SelectItem>
                      <SelectItem value={{ lightSquare: '#e0e4e8', darkSquare: '#779ab6', name: 'Ice Sea' }}>
                        Ice Sea
                      </SelectItem>
                      <SelectItem value={{ lightSquare: '#ffffff', darkSquare: '#586e75', name: 'Bases' }}>
                        Bases
                      </SelectItem>
                      <SelectItem
                        value={{
                          lightSquare: 'rgba(255, 255, 255, 0.75)',
                          darkSquare: 'rgba(0, 0, 0, 0.6)',
                          name: 'Transculent',
                        }}
                      >
                        Translucent
                      </SelectItem>
                      <SelectItem value={{ lightSquare: '#add8e6', darkSquare: '#4682b4', name: 'Blue' }}>
                        Blue
                      </SelectItem>
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
