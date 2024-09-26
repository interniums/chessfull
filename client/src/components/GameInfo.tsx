// @ts-nocheck

import { ReloadIcon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import useAuth from '@/hooks/useAuth'
import GameInfoHeader from './GameInfoHeader'
import GameInfoMain from './GameInfoMain'
import GameInfoFooter from './GameInfoFooter'

export default function GameInfo({
  mode,
  players,
  opponentDisconnected,
  roomId,
  sock,
  waitDrawAnswer,
  setWaitDrawAnswer,
  offerDraw,
  setOfferDraw,
  over,
  winner,
  loading,
  history,
  capturedPieces,
  player1Orientation,
  player2Orientation,
  orientation,
}) {
  const { auth } = useAuth()
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
    <div className="w-full min-w-80 border rounded-md py-2 block content-start shadow-md" style={{ minHeight: '75%' }}>
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
          <GameInfoHeader
            players={players}
            winner={winner}
            opponentDisconnected={opponentDisconnected}
            capturedPieces={capturedPieces}
            player1Orientation={player1Orientation}
            player2Orientation={player2Orientation}
            orientation={orientation}
          />
          <GameInfoMain
            offerDraw={offerDraw}
            handleAcceptDraw={handleAcceptDraw}
            handleRefuseDraw={handleRefuseDraw}
            handleOfferDraw={handleOfferDraw}
            over={over}
            handleResign={handleResign}
            history={history}
            waitDrawAnswer={waitDrawAnswer}
          />
          <div className="self-end">
            <GameInfoFooter
              winner={winner}
              players={players}
              opponentDisconnected={opponentDisconnected}
              capturedPieces={capturedPieces}
              player1Orientation={player1Orientation}
              player2Orientation={player2Orientation}
              orientation={orientation}
            />
          </div>
        </>
      )}
    </div>
  )
}
