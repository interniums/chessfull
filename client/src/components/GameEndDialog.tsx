// @ts-nocheck

import { Cross1Icon } from '@radix-ui/react-icons'
import useAuth from '@/hooks/useAuth'
import pawn from '../assets/pawn.png'
import queen from '../assets/queen.png'
import rook from '../assets/rook.png'
import { Button } from './ui/button'

export default function GameEndDialog({ setOpenEndDialog, playerStats, gameState, mode }) {
  const { auth } = useAuth()
  return (
    <>
      <div
        className="absolute top-1/2 left-1/2 h-max w-1/4 z-50 border rounded-md shadow-md bg-white py-6 px-8 flex items-center justify-center"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div className="w-full h-full">
          <div className="absolute right-3 top-3" onClick={() => setOpenEndDialog(false)}>
            <Cross1Icon className="size-10 hover:bg-slate-200 cursor-pointer p-2 rounded-lg" />
          </div>
          <header className="grid gap-6 w-full">
            <div className="flex items-center justify-center w-full">
              <div className="grid gap-1 items-center justify-center justify-items-center">
                <img
                  className="size-36"
                  src={mode == 'bullet' ? rook : mode == 'rapid' ? pawn : mode == 'blitz' ? queen : null}
                  alt="image"
                />
                <h1 className="text-4xl text-center">
                  {gameState?.winner == auth.id ? 'Won' : gameState?.winner == 'Draw' ? 'Draw' : 'Lost'}
                </h1>
                <p className="text-l text-center">Due to {gameState?.over}</p>
              </div>
            </div>
            <p className="text-center text-xl text-ellipsis">
              <span className="mr-2 text-ellipsis text-center w-full">{playerStats[0]?.name}</span> vs{' '}
              <span className="ml-2 text-ellipsis text-center w-full">{playerStats[1]?.name}</span>
            </p>
          </header>
          <main className="grid items-center justify-center pt-8">
            <div className="flex items-center justify-center gap-8">
              <Button variant={'outline'} className="w-full">
                Offer a rematch
              </Button>
              <Button variant={'outline'} className="w-full">
                New {mode} game
              </Button>
            </div>
            <div className="pt-8 grid gap-2">
              <p className="text-center">
                You earnd{' '}
                <span>
                  {gameState?.winner == auth.id ? (
                    <>
                      <span className="font-bold">+ 25</span>
                    </>
                  ) : gameState?.winner == 'Draw' ? (
                    '0'
                  ) : (
                    <>
                      <span className="font-bold">- 25</span>
                    </>
                  )}
                </span>{' '}
                elo this game
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
