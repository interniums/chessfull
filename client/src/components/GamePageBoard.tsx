// @ts-nocheck

import { Chess } from 'chess.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import queen from '../assets/queen.png'
import { ArrowLeftIcon, ArrowRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons'
import GameInfo from './GameInfo'
import getSocket from '@/socket'

export default function GamePageBoard({ players, room, orientation, cleanup }) {
  const chess = useMemo(() => new Chess(), []) // <- 1
  const [fen, setFen] = useState(chess.fen()) // <- 2
  const [over, setOver] = useState('')
  const sock = getSocket()

  const makeAMove = useCallback(
    (move) => {
      try {
        const result = chess.move(move) // update Chess instance
        setFen(chess.fen()) // update fen state to trigger a re-render

        console.log('over, checkmate', chess.isGameOver(), chess.isCheckmate())

        if (chess.isGameOver()) {
          // check if move led to "game over"
          if (chess.isCheckmate()) {
            // if reason for game over is a checkmate
            // Set message to checkmate.
            setOver(`Checkmate! ${chess.turn() === 'w' ? 'black' : 'white'} wins!`)
            // The winner is determined by checking for which side made the last move
          } else if (chess.isDraw()) {
            // if it is a draw
            setOver('Draw') // set message to "Draw"
          } else {
            setOver('Game over')
          }
        }

        return result
      } catch (e) {
        return null
      } // null if the move was illegal, the move object if the move was legal
    },
    [chess]
  )

  // onDrop function
  function onDrop(sourceSquare, targetSquare) {
    // orientation is either 'white' or 'black'. game.turn() returns 'w' or 'b'
    if (chess.turn() !== orientation[0]) return false // <- 1 prohibit player from moving piece of other player

    if (players.length < 2) return false // <- 2 disallow a move if the opponent has not joined

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: 'q', // promote to queen where possible
    }

    const move = makeAMove(moveData)

    // illegal move
    if (move === null) return false

    sock.emit('move', {
      // <- 3 emit a move event.
      move,
      room,
    }) // this event will be transmitted to the opponent via the server

    return true
  }

  useEffect(() => {
    sock.on('move', (move) => {
      makeAMove(move) //
    })
  }, [makeAMove])

  return (
    <>
      <div className="w-full h-full flex items-center pl-20 pr-96">
        <div className="w-full pr-24">
          <div className="h-full flex items-center justify-center">
            <GameInfo />
          </div>
        </div>
        <div className="grid gap-1 h-full" style={{ maxWidth: '85vh', width: '85vh' }}>
          <div className="w-full flex items-center justify-center gap-8 py-2">
            <div className="text-2xl">W 3:02</div>
            <div className="text-2xl">|</div>
            <div className="text-2xl">B 1:53</div>
          </div>
          <div className="board" style={{ maxWidth: '85vh', width: '85vh' }}>
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              customBoardStyle={{
                borderRadius: '4px',
                boardOrientation: orientation,
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
