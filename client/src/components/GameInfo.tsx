// @ts-nocheck

import { ReloadIcon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import useAuth from '@/hooks/useAuth'
import GameInfoHeader from './GameInfoHeader'
import GameInfoMain from './GameInfoMain'
import GameInfoFooter from './GameInfoFooter'
import { Avatar, AvatarImage } from './ui/avatar'
import avatar from '../assets/images/avatar.svg'
import CapturedPieces from './GameInfoMainCapturedPiece'
import InGameSettings from './InGameSettings'
import loadinggif from '../assets/images/loading gif.webp'

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
  userPreferences,
  setUserPreferences,
  fenHistory,
  currentMoveIndex,
  goToFirstMove,
  goToPreviousMove,
  goToNextMove,
  goToLastMove,
  goToIndexMove,
  isSmallScreen,
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
    <div
      className="w-full lg:min-w-80 lg:border lg:rounded-md lg:py-2 lg:block lg:content-start lg:shadow-md"
      style={{ minHeight: isSmallScreen ? '75%' : 'none' }}
    >
      {loading ? (
        <div className="min-h-80 py-8 px-16">
          <div className="grid gap-6 items-center justify-center">
            {/* <div className="w-full flex items-center justify-center">
              <ReloadIcon className="animate-spin size-44" />
            </div>
            <div className="text-center text-2xl">Loading...</div> */}
            <img src={loadinggif} alt="loading" className="size-44" />
            <div className="dot-elastic"></div>
          </div>
        </div>
      ) : (
        <>
          {!isSmallScreen ? (
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
                fenHistory={fenHistory}
                currentMoveIndex={currentMoveIndex}
                goToFirstMove={goToFirstMove}
                goToPreviousMove={goToPreviousMove}
                goToNextMove={goToNextMove}
                goToLastMove={goToLastMove}
                goToIndexMove={goToIndexMove}
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
                  userPreferences={userPreferences}
                  setUserPreferences={setUserPreferences}
                />
              </div>
            </>
          ) : (
            <div className="mt-6 w-screen">
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="flex items-center justify-start">
                    <Avatar
                      className="cursor-pointer h-10 w-10"
                      onClick={() => {
                        navigate(`/profile/${players[0].id == auth.id ? players[1]?.id : players[0]?.id}`)
                      }}
                    >
                      <AvatarImage className="p-1.5" src={avatar} />
                    </Avatar>
                    <div
                      onClick={() => {
                        navigate(`/profile/${players[0].id == auth.id ? players[1]?.id : players[0]?.id}`)
                      }}
                      className="px-4 text-md text-ellipsis cursor-pointer flex items-center justify-center gap-2 font-medium"
                      style={{
                        textDecoration:
                          winner !== auth.id && winner !== 'Draw' && winner.length ? 'underline green' : 'none',
                      }}
                    >
                      {players[0].id == auth.id ? players[1]?.name : players[0]?.name}
                    </div>
                  </div>
                  <div>
                    {opponentDisconnected && (
                      <h1 className="text-red-400 animate-pulse">Waiting for opponent to connect...</h1>
                    )}
                    <hr className="mb-2" />
                    <div className="text-center mb-2">
                      <span className="font-bold text-md">
                        {players[0].id == auth.id ? players[1]?.elo : players[0]?.elo}
                      </span>{' '}
                      elo{' '}
                    </div>
                    <CapturedPieces
                      color={auth?.id == players[0].id ? player1Orientation : player2Orientation}
                      capturedPieces={capturedPieces}
                      isSmallScreen={isSmallScreen}
                    />
                  </div>
                </div>
                <p>vs</p>
                <div>
                  <div className="flex items-center justify-start">
                    <div
                      onClick={() => {
                        navigate(`/profile/${players[0].id == auth.id ? players[0]?.id : players[1]?.id}`)
                      }}
                      className="px-4 text-md  text-ellipsis cursor-pointer flex items-center justify-center font-medium"
                      style={{
                        textDecoration: winner === auth.id ? 'underline green' : 'none',
                      }}
                    >
                      {players[0].id == auth.id ? players[0]?.name : players[1]?.name}
                      <div className="ml-2"></div>
                    </div>
                    <Avatar
                      className="cursor-pointer w-10 h-10"
                      onClick={() => {
                        navigate(`/profile/${players[0].id == auth.id ? players[0]?.elo : players[1]?.elo}`)
                      }}
                    >
                      <AvatarImage className="p-1.5" src={avatar} />
                    </Avatar>
                  </div>
                  <div>
                    <hr className="mb-2" />
                    <div className="text-center mb-2">
                      <span className="font-bold text-md">
                        {players[0].id == auth.id ? players[0]?.elo : players[1]?.elo}
                      </span>{' '}
                      elo
                    </div>
                    <CapturedPieces
                      color={auth?.id == players[0].id ? player2Orientation : player1Orientation}
                      capturedPieces={capturedPieces}
                      isSmallScreen={isSmallScreen}
                    />
                  </div>
                </div>
              </div>
              <div>
                <InGameSettings userPreferences={userPreferences} setUserPreferences={setUserPreferences} />
              </div>
              <div>
                {offerDraw ? (
                  <>
                    <div className="w-full flex items-center justify-center animate-pulse mt-4 px-4">
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
                  <div className="flex gap-8 mt-10 mb-4 items-center justify-center">
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
                      <Button disabled={over.length ? true : false} variant={'outline'} onClick={() => handleResign()}>
                        Resign
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
