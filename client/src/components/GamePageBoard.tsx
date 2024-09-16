// @ts-nocheck

import { Chess } from 'chess.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import queen from '../assets/queen.png'
import { ArrowLeftIcon, ArrowRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons'
import GameInfo from './GameInfo'
import getSocket from '@/socket'
import useAuth from '@/hooks/useAuth'

export default function GamePageBoard({ mode, players, moves, setMoves, roomId, orientation }) {
  const { auth } = useAuth()
  const sock = getSocket()
  const chess = useMemo(() => new Chess(), [])
  const [fen, setFen] = useState(chess.fen())
  const [over, setOver] = useState('')
  const [playerSide, setPlayerSide] = useState(auth.id == players[0] ? 'white' : 'black')
  // console.log(orientation)
  // console.log(players[0])
  // console.log('id', auth.id)
  // console.log(players[1])

  const player1Orientation = orientation
  const player2Orientation = orientation === 'white' ? 'black' : 'white'

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
      }
    },
    [chess]
  )

  // onDrop function
  function onDrop(sourceSquare, targetSquare) {
    if (chess.turn() !== playerSide[0]) return false // prohibit player from moving piece of other player

    if (players.length < 2) return false // disallow a move if the opponent has not joined

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: 'q',
    }

    const move = makeAMove(moveData)

    // illegal move
    if (move === null) return false

    sock.emit('makeMove', {
      move,
      roomId,
    })

    return true
  }

  useEffect(() => {
    sock.on('opponentMove', (move) => {
      makeAMove(move)
    })
  }, [makeAMove])

  return (
    <>
      <div className="w-full h-full flex items-center pl-20 pr-96">
        <div className="w-full pr-24">
          <div className="h-full flex items-center justify-center">
            <GameInfo
              mode={mode}
              players={players}
              moves={moves}
              setMoves={setMoves}
              roomId={roomId}
              orientation={orientation}
            />
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
              arePremovesAllowed={true}
              position={fen}
              onPieceDrop={onDrop}
              boardOrientation={auth.id === players[0] ? player1Orientation : player2Orientation}
              customBoardStyle={{
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
