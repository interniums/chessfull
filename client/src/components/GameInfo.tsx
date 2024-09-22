// @ts-nocheck

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ReloadIcon,
} from '@radix-ui/react-icons'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

export default function GameInfo({
  mode,
  players,
  opponentDisconnected,
  roomId,
  sock,
  playerStats,
  waitDrawAnswer,
  setWaitDrawAnswer,
  offerDraw,
  setOfferDraw,
  over,
  winner,
}) {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(false)
  const [game, setGame] = useState(true)

  const handleOfferDraw = () => {
    if (over.length) {
      return
    }
    setWaitDrawAnswer(true)
    sock.emit('offerDraw', { roomId, id: auth.id, socketId: sock.id })
  }

  const handleAcceptDraw = () => {
    sock.emit('acceptDraw', { roomId, mode })
    setOfferDraw(null)
  }

  const handleRefuseDraw = () => {
    sock.emit('refuseDraw', { roomId, id: auth.id, socketId: sock.id })
    setOfferDraw(null)
  }

  const handleResign = () => {
    if (over.length) {
      return
    }
    sock.emit('resign', { roomId, id: auth.id, mode })
  }

  return (
    <div className="w-full min-w-80 h-max border rounded-md py-2 grid content-between shadow-md">
      {loading ? (
        <div className="min-h-80 py-8 px-16">
          <div className="grid gap-6 items-center justify-center">
            <div className="w-full flex items-center justify-center">
              <ReloadIcon className="animate-spin size-44" />
            </div>
            <div className="text-center text-2xl">Loading...</div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex w-full min-h-24 items-center justify-center">
            <div className="text-center w-full">
              <div className="px-4 text-l text-ellipsis">
                <span className="font-bold">GM </span>
                {players[0] == auth.id ? playerStats[1]?.name : playerStats[0]?.name}
                {opponentDisconnected && (
                  <h1 className="text-red-400 animate-pulse">Waiting for opponent to connect...</h1>
                )}
              </div>
              <hr className="mt-2" />
              <div className="text-center mt-2">
                <span className="font-bold">{players[0] == auth.id ? playerStats[1]?.elo : playerStats[0]?.elo}</span>{' '}
                elo{' '}
              </div>
            </div>
          </div>
          <div className="w-full px-6 max-h-full h-full">
            {offerDraw ? (
              <>
                <div className="w-full min-h-80 flex items-center justify-center animate-pulse mt-10">
                  <div className="w-full h-full">
                    <h1 className="text-center">Your opponent is offering a draw</h1>
                    <div className="flex items-center justify-center gap-8 mt-6">
                      <Button className="w-full" variant={'outline'} onClick={() => handleAcceptDraw()}>
                        Accept
                      </Button>
                      <Button
                        variant={'outline'}
                        className="w-full"
                        onClick={() => {
                          handleRefuseDraw()
                        }}
                      >
                        Refuse
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-full flex items-center justify-center gap-8">
                  <div>
                    <DoubleArrowLeftIcon className="size-8 rounded cursor-pointer hover:bg-slate-300 py-1 px-1" />
                  </div>
                  <div>
                    <ArrowLeftIcon className="size-8 rounded cursor-pointer hover:bg-slate-300 py-1 px-1" />
                  </div>
                  <div className="cursor-pointer">
                    <ArrowRightIcon className="size-8 rounded cursor-pointer hover:bg-slate-300 py-1 px-1" />
                  </div>
                  <div className="cursor-pointer">
                    <DoubleArrowRightIcon className="size-8 rounded cursor-pointer hover:bg-slate-300 py-1 px-1" />
                  </div>
                </div>
                <div className="flex py-4 w-full max-h-64 overflow-y-auto items-start">
                  <div className="border-r w-min pr-2">
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                    <div>4</div>
                    <div>5</div>
                    <div>6</div>
                    <div>7</div>
                    <div>8</div>
                    <div>9</div>
                    <div>10</div>
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                    <div>4</div>
                    <div>5</div>
                    <div>6</div>
                    <div>7</div>
                    <div>8</div>
                    <div>9</div>
                    <div>10</div>
                  </div>
                  <div className="flex w-full px-2 justify-center items-center">
                    <div className="w-full">
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">f4</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">e5</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">g6</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">0-0</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">f8</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">e2</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">f1</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">g3</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">h9</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">f2</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">f4</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">e5</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">g6</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">0-0</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">f8</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">e2</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">f1</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">g3</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">h9</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">f2</div>
                    </div>
                    <div className="w-full">
                      <div className="text-center hover:bg-slate-300 cursor-pointer">h9</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer">f4</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer">e5</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer">g6</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer">e2</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer">f1</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer">0-0</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer">f2</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer">g3</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer">f8</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">f4</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">e5</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">g6</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">0-0</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">f8</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">e2</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">f1</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">g3</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">h9</div>
                      <div className="text-center hover:bg-slate-300 cursor-pointer ">f2</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-8 mt-4 mb-4 items-center justify-center">
                  {game ? (
                    <>
                      <div className={waitDrawAnswer ? 'animate-pulse' : ''}>
                        <Button
                          disabled={waitDrawAnswer || over.length ? true : false}
                          variant={'outline'}
                          onClick={() => handleOfferDraw()}
                        >
                          {waitDrawAnswer ? 'Draw offered' : 'Offer Draw '}
                        </Button>
                      </div>
                      <div>
                        <Button
                          disabled={over.length ? true : false}
                          variant={'outline'}
                          onClick={() => handleResign()}
                        >
                          Resign
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Button variant={'outline'}>Offer Rematch</Button>
                      </div>
                      <div>
                        <Button variant={'outline'}>Find new game</Button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex w-full min-h-24 items-center justify-center">
            <div className="text-center w-full">
              <div className="text-center mb-2">
                <span className="font-bold">{players[0] == auth.id ? playerStats[0]?.elo : playerStats[1]?.elo}</span>{' '}
                elo
              </div>
              <hr className="mb-2" />
              <div className="px-4 text-l text-ellipsis">
                <span className="font-bold">GM </span>
                {players[0] == auth.id ? playerStats[0]?.name : playerStats[1]?.name}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
