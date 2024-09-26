// @ts-nocheck

import { Chess } from 'chess.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { axiosPrivate } from '@/api/axios'
import { Button } from './ui/button'
import { useToast } from '@/hooks/use-toast'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import GameInfo from './GameInfo'
import GameEndDialog from './GameEndDialog'
import useAuth from '@/hooks/useAuth'

export default function GamePageBoard({ mode, players, moves, setMoves, roomId, orientation, sock }) {
  const player1Orientation = orientation
  const player2Orientation = orientation === 'white' ? 'black' : 'white'

  const { toast } = useToast()
  const { auth } = useAuth()
  const chess = useMemo(() => new Chess(), [])
  const axiosPrivate = useAxiosPrivate()

  const [history, setHistory] = useState([])
  const [gameState, setGameState] = useState({
    over: '',
    winner: '',
    players: [],
    state: '',
    history: [],
  })
  const [fen, setFen] = useState(chess.fen())
  const [playerSide, setPlayerSide] = useState(auth.id == players[0].id ? player1Orientation : player2Orientation)
  const [opponentDisconnected, setOpponentDisconnected] = useState(false)
  const [offerDraw, setOfferDraw] = useState(null)
  const [waitDrawAnswer, setWaitDrawAnswer] = useState(null)
  const [openEndDialog, setOpenEndDialog] = useState(null)
  const [loading, setLoading] = useState(false)
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] })

  const [rightClickedSquares, setRightClickedSquares] = useState({})
  const [showPromotionDialog, setShowPromotionDialog] = useState(false)
  const [moveSquares, setMoveSquares] = useState({})
  const [optionSquares, setOptionSquares] = useState({})
  const [moveFrom, setMoveFrom] = useState('')
  const [moveTo, setMoveTo] = useState<Square | null>(null)
  const [allowPremoves, setAllowPremoves] = useState(history ? false : true)
  const [isPieceDragged, setIsPieceDragged] = useState(false)

  const waitDrawAnswerRef = useRef(waitDrawAnswer)
  const overRef = useRef(gameState?.over)

  // console.log(fen)
  // console.log(history)
  // console.log(gameState)
  // console.log(chess.turn())
  // console.log(gameState)
  // console.log(chess)
  console.log('is peice dragged', isPieceDragged)

  useEffect(() => {
    if (!gameState?.over.length && history.length) sock.emit('updateHistory', { roomId, history })
  }, [history])

  useEffect(() => {
    waitDrawAnswerRef.current = waitDrawAnswer
  }, [waitDrawAnswer])

  useEffect(() => {
    overRef.current = gameState?.over
  }, [gameState])

  useEffect(() => {
    if (gameState?.over.length && openEndDialog == null) {
      setOpenEndDialog(true)
    }
  }, [gameState])

  useEffect(() => {
    console.log('getting game state')

    let isMounted = true
    const controller = new AbortController()
    setLoading(true)

    const getState = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/game/state/${roomId}`, {
          signal: controller.signal,
        })
        console.log('setting winner if possible')
        isMounted && loadGameState(response.data)
      } catch (err) {
        console.error(err)
      }
    }

    getState()

    return () => {
      isMounted = false
      controller.abort()
      setLoading(false)
    }
  }, [])

  const makeAMove = useCallback(
    (move) => {
      try {
        const result = chess.move(move)
        setFen(chess.fen())
        setHistory(chess.history())

        if (result) {
          if (result.captured) {
            const piece = result.captured
            const color = result.color === 'w' ? 'black' : 'white'
            setCapturedPieces((prev) => ({
              ...prev,
              [color]: [...prev[color], piece],
            }))
          }
        }

        console.log('over, checkmate', chess.isGameOver(), chess.isCheckmate())

        if (gameState?.winner.length < 1) {
          if (chess.isGameOver()) {
            if (chess.isCheckmate()) {
              console.log('checkmate')

              const color = chess.turn() === 'w' ? 'black' : 'white'
              const winner = orientation == color ? players[0].id : players[1].id

              sock.emit('checkmate', { roomId, winner, mode })
            } else if (chess.isInsufficientMaterial()) {
              console.log('draw due to insufficient material')

              sock.emit('insufficient material', { roomId, mode })
            } else if (chess.isStalemate()) {
              console.log('stalemate')

              sock.emit('stalemate', { roomId, mode })
            } else if (chess.isThreefoldRepetition()) {
              console.log('draw due to threefold repetition')

              sock.emit('threefold repetition', { roomId, mode })
            }
          }
        }

        return result
      } catch (e) {
        return null
      }
    },
    [chess]
  )

  function onPromotionPieceSelect(piece) {
    if (!piece) return false
    console.log(moveFrom, moveTo, piece)

    const moveData = {
      from: moveFrom,
      to: moveTo,
      promotion: piece[1].toLowerCase(),
    }

    const move = makeAMove(moveData)

    if (move === null) {
      console.error('Invalid move during promotion')
      return false
    }

    if (!gameState?.over.length) {
      sock.emit('move', {
        move,
        roomId,
        fen: chess.fen(),
      })
    }

    setMoveFrom('')
    setMoveTo(null)
    setShowPromotionDialog(false)
    setOptionSquares({})

    return true
  }

  function onDrop(sourceSquare, targetSquare, piece) {
    if (!overRef.current.length && chess.turn() !== playerSide[0]) {
      console.log('Not your turn.')
      return false
    }
    if (!allowPremoves) {
      setAllowPremoves(true)
    }

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase(),
    }

    const move = makeAMove(moveData)

    if (move === null) return false

    if (!gameState?.over.length) {
      sock.emit('move', {
        move,
        roomId,
        fen: chess.fen(),
      })
    }
    setOptionSquares({})
    return true
  }

  function getMoveOptions(square) {
    const moves = chess.moves({
      square,
      verbose: true,
    })
    if (moves.length === 0) {
      setOptionSquares({})
      return false
    }
    const newSquares = {}
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          chess.get(move.to) && chess.get(move.to).color !== chess.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      }
      return move
    })
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    }
    setOptionSquares(newSquares)
    return true
  }

  function onSquareRightClick(square) {
    console.log('right click')

    const colour = 'rgba(255, 0, 0, 0.65)'
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    })

    setIsPieceDragged(false)
    setOptionSquares({})
    setMoveSquares({})
    setMoveFrom('')
  }

  function onSquareClick(square) {
    console.log('squere clicked')
    setRightClickedSquares({})
    setIsPieceDragged(false)

    if (!overRef.current.length && chess.turn() !== playerSide[0]) {
      console.log('Not your turn.')
      return false
    }

    // Handle the selection of the piece to move (from square)
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square)
      if (hasMoveOptions) setMoveFrom(square)
      return
    }

    // Handle the target square (to square)
    if (!moveTo) {
      const moves = chess.moves({ square: moveFrom, verbose: true })
      const foundMove = moves.find((m) => m.from === moveFrom && m.to === square)

      if (!foundMove) {
        // If a new piece is clicked, set the new "moveFrom" square
        const hasMoveOptions = getMoveOptions(square)
        setMoveFrom(hasMoveOptions ? square : '')
        return
      }

      setMoveTo(square)
      // If it's a promotion move, show the promotion dialog
      if (
        (foundMove.color === 'w' && foundMove.piece === 'p' && square[1] === '8') ||
        (foundMove.color === 'b' && foundMove.piece === 'p' && square[1] === '1')
      ) {
        setShowPromotionDialog(true)
        return
      }

      // Make the move if it's not a promotion
      const moveData = {
        from: moveFrom,
        to: square,
        promotion: 'q',
      }

      const move = makeAMove(moveData)

      if (move === null) {
        const hasMoveOptions = getMoveOptions(square)
        setMoveFrom(hasMoveOptions ? square : '')
        return
      }

      if (!gameState?.over.length) {
        sock.emit('move', {
          move,
          roomId,
          fen: chess.fen(),
        })
      }

      setMoveFrom('')
      setMoveTo(null)
      setOptionSquares({})
      return
    }
  }

  useEffect(() => {
    sock.on('move', (move) => {
      makeAMove(move)
    })
  }, [makeAMove])

  useEffect(() => {
    sock.on('opponentDisconnected', () => {
      console.log('opponent disconnected')
      if (!gameState?.over.length) {
        setOpponentDisconnected(true)
        sock.emit('sendFen', { fen: chess.fen(), roomId })
      }
    })

    sock.on('opponentReconnected', () => {
      setOpponentDisconnected(false)
    })

    sock.on('gameEnd', (data) => {
      if (data.winner.length > 1) {
        setGameState((prev) => ({ ...prev, over: data.endState, winner: data.winner }))
        setOfferDraw(null)
        setOpponentDisconnected(false)
        setWaitDrawAnswer(false)
      }
    })

    sock.on('offerDraw', () => {
      if (waitDrawAnswer) {
        return
      }
      setOfferDraw(true)
    })

    sock.on('drawRefused', () => {
      if (!waitDrawAnswerRef.current) {
        return
      }
      toast({
        title: 'Draw refused',
        duration: 2000,
        description: 'Opponent refused taking draw',
      })
      setWaitDrawAnswer(null)
    })

    sock.on('disconnect', () => {
      console.log('server stopped')
    })
  }, [sock])

  const loadGameState = (data) => {
    setGameState((prev) => ({
      ...prev,
      winner: data.winner,
      over: data.endState,
      state: data.state,
      players: data.players,
      history: data.history,
    }))

    setFen(data.state)
    data.history.forEach((move) => {
      makeAMove(move)
    })

    setLoading(false)
  }

  return (
    <>
      <div className="w-full h-full flex items-center pl-20 pr-96 min-h-screen">
        {openEndDialog ? (
          <GameEndDialog
            setOpenEndDialog={setOpenEndDialog}
            players={players}
            gameState={gameState}
            mode={mode}
            loading={loading}
          />
        ) : null}
        <div className="w-full h-full pr-24 min-h-screen">
          <div className="min-h-screen h-full w-full flex items-start justify-center min-w-max py-24">
            <GameInfo
              opponentDisconnected={opponentDisconnected}
              mode={mode}
              players={players}
              roomId={roomId}
              sock={sock}
              offerDraw={offerDraw}
              setOfferDraw={setOfferDraw}
              waitDrawAnswer={waitDrawAnswer}
              setWaitDrawAnswer={setWaitDrawAnswer}
              over={gameState?.over}
              winner={gameState?.winner}
              loading={loading}
              history={history}
              capturedPieces={capturedPieces}
              orientation={orientation}
              player1Orientation={player1Orientation}
              player2Orientation={player2Orientation}
            />
          </div>
        </div>
        <div className="grid gap-1 h-full min-h-screen" style={{ maxWidth: '85vh', width: '85vh' }}>
          <div className="w-full flex items-center justify-center gap-8 py-2">
            <div className="text-2xl">W 3:02</div>
            <div className="text-2xl">|</div>
            <div className="text-2xl">B 1:53</div>
          </div>
          <div
            className="board"
            style={{
              maxWidth: '85vh',
              width: '85vh',
            }}
          >
            <Chessboard
              arePremovesAllowed={allowPremoves}
              position={fen}
              onPieceDrop={onDrop}
              boardOrientation={auth.id === players[0].id ? player1Orientation : player2Orientation}
              onPieceClick={() => {
                !allowPremoves ? setAllowPremoves(true) : null
              }}
              onPieceDragBegin={() => {
                setIsPieceDragged(true)
              }}
              onSquareClick={onSquareClick}
              onSquareRightClick={onSquareRightClick}
              onPromotionPieceSelect={!isPieceDragged ? onPromotionPieceSelect : undefined}
              promotionToSquare={!isPieceDragged ? moveTo : undefined}
              promotionDialogVariant="modal"
              showPromotionDialog={!isPieceDragged ? showPromotionDialog : undefined}
              customSquareStyles={{
                ...moveSquares,
                ...optionSquares,
                ...rightClickedSquares,
              }}
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
