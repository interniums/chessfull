// @ts-nocheck

import { useMemo, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import Engine from '../utils/engine'
import { Chess } from 'chess.js'

export default function ComputerGame() {
  const engine = useMemo(() => new Engine(), [])
  const game = useMemo(() => new Chess(), [])
  const [gamePosition, setGamePosition] = useState(game.fen())
  const [stockfishLevel, setStockfishLevel] = useState(2)

  function findBestMove() {
    engine.evaluatePosition(game.fen(), stockfishLevel)
    engine.onMessage(({ bestMove }) => {
      if (bestMove) {
        // In latest chess.js versions you can just write ```game.move(bestMove)```
        game.move({
          from: bestMove.substring(0, 2),
          to: bestMove.substring(2, 4),
          promotion: bestMove.substring(4, 5),
        })
        setGamePosition(game.fen())
      }
    })
  }

  function onDrop(sourceSquare, targetSquare, piece) {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase() ?? 'q',
    })
    setGamePosition(game.fen())

    // illegal move
    if (move === null) return false

    // exit if the game is over
    if (game.game_over() || game.in_draw()) return false
    findBestMove()
    return true
  }

  return (
    <main className="absolute inset-0 flex items-center justify-center">
      <div
        className="board h-fit rounded-md"
        style={{
          maxWidth: '85vh',
          width: '85vh',
          boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 10px',
        }}
      >
        <Chessboard id="PlayVsStockfish" position={gamePosition} onPieceDrop={onDrop} />
      </div>
    </main>
  )
}
