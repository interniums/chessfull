// @ts-nocheck

import { Cross1Icon, ReloadIcon } from '@radix-ui/react-icons'
import useAuth from '@/hooks/useAuth'
import pawn from '../assets/images/pawn.png'
import queen from '../assets/images/queen.png'
import rook from '../assets/images/rook.png'
import { Button } from './ui/button'
import { motion } from 'framer-motion'

export default function GameEndDialog({ setOpenEndDialog, gameState, mode, loading, players }) {
  const { auth } = useAuth()

  return (
    <>
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center z-40"
        onClick={() => setOpenEndDialog(false)}
      >
        <motion.div
          key={'endDialog'}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          onClick={(e) => e.stopPropagation()}
          className="z-50 border rounded-md shadow-md bg-white py-6 px-8 flex items-center justify-center relative"
        >
          <div className="w-full h-full">
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
                {' '}
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
                      <p className="text-xl text-center font-medium">Due to {gameState?.over}</p>
                    </div>
                  </div>
                  <div>
                    <div className="text-center text-xl text-ellipsis flex items-center justify-center">
                      <span
                        className="text-ellipsis text-center w-full"
                        style={{
                          textDecorationLine: gameState?.winner === players[0]?.id ? 'underline' : 'none',
                        }}
                      >
                        {players[0]?.name}
                      </span>{' '}
                      vs{' '}
                      <span
                        className="ml-4 text-ellipsis text-center w-full"
                        style={{
                          textDecorationLine: gameState?.winner === players[1]?.id ? 'underline' : 'none',
                        }}
                      >
                        {players[1]?.name}
                      </span>
                    </div>
                  </div>
                </header>
                <main className="grid items-center justify-center pt-8">
                  <div className="flex items-center justify-center gap-8">
                    <Button variant={'outline'} className="w-full text-xl">
                      Offer a rematch
                    </Button>
                    <Button variant={'outline'} className="w-full text-xl">
                      New {mode} game
                    </Button>
                  </div>
                  <div className="pt-8 grid gap-2">
                    <p className="text-center font-bold">
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
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
