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
import moveSound from '../assets/move.mp3'
import captureSound from '../assets/capture.mp3'
import endGameSound from '../assets/endGame.mp3'
import UIfx from 'uifx'

export default function GamePageBoard({ mode, players, moves, setMoves, roomId, orientation, sock }) {
  const player1Orientation = orientation
  const player2Orientation = orientation === 'white' ? 'black' : 'white'

  // sounds
  const moveSoundPlay = new UIfx(moveSound, {
    volume: 1,
  })
  const captureSoundPlay = new UIfx(captureSound, {
    volume: 1,
  })
  const endGameSoundPlay = new UIfx(endGameSound, {
    volume: 1,
  })

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
  const [isPieceDragged, setIsPieceDragged] = useState(false)
  const [highlightedSquare, setHighlightedSquare] = useState(null)
  // moves navigation logic
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [fenHistory, setFenHistory] = useState([])
  // fix not working drag and drop after reconnect
  const [allowPremoves, setAllowPremoves] = useState(history ? false : true)
  // user preferences
  const [userPreferences, setUserPreferences] = useState({})
  const waitDrawAnswerRef = useRef(waitDrawAnswer)
  const overRef = useRef(gameState?.over)

  // console.log(fen)
  // console.log(history)
  // console.log(gameState)
  // console.log(chess.turn())
  // console.log(gameState)
  // console.log(currentMoveIndex)
  // console.log(fenHistory.length)
  // console.log(chess)

  // Function to go to the first move
  const goToFirstMove = () => {
    setCurrentMoveIndex(0)
    chess.load(fenHistory[0])
    setFen(fenHistory[0])
  }

  const goToIndexMove = (index) => {
    if (index == fenHistory.length - 1) {
      return
    }
    setCurrentMoveIndex(index)
    chess.load(fenHistory[index])
    setFen(fenHistory[index])
  }

  // Function to go to the previous move
  const goToPreviousMove = () => {
    console.log('previus move called')
    if (currentMoveIndex > 0) {
      const newIndex = currentMoveIndex - 1
      setCurrentMoveIndex(newIndex)
      chess.load(fenHistory[newIndex])
      setFen(fenHistory[newIndex])
    }
  }

  // Function to go to the next move
  const goToNextMove = () => {
    if (currentMoveIndex < fenHistory.length - 1) {
      const newIndex = currentMoveIndex + 1
      setCurrentMoveIndex(newIndex)
      chess.load(fenHistory[newIndex])
      setFen(fenHistory[newIndex])
    }
  }

  // Function to go to the last move
  const goToLastMove = () => {
    if (currentMoveIndex !== fenHistory.length - 1) {
      const lastIndex = fenHistory.length - 1
      setCurrentMoveIndex(lastIndex)
      chess.load(fenHistory[lastIndex])
      setFen(fenHistory[lastIndex])
    }
  }

  // get user preferences
  useEffect(() => {
    setLoading(true)
    let isMounted = true
    const controller = new AbortController()

    const getUserPreferences = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/user//${auth?.id}/getPreferences`, {
          signal: controller.signal,
        })
        isMounted && setUserPreferences(response.data)
      } catch (err) {
        console.error(err)
      }
    }

    getUserPreferences()

    return () => {
      isMounted = false
      controller.abort()
      setLoading(false)
    }
  }, [])

  // update user preferences logic
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const updateUserPreferences = async () => {
      try {
        const response = await axiosPrivate.patch(`http://localhost:3000/user/update/preferences`, {
          signal: controller.signal,
          pieceSpeedAnimation: userPreferences?.pieceSpeedAnimation,
          pieceMoveType: userPreferences?.pieceMoveType,
          premovesAllowed: userPreferences?.premovesAllowed,
          queenPromotion: userPreferences?.queenPromotion,
          id: auth.id,
        })

        console.log('user preferences updated')
      } catch (err) {
        console.error(err)
      }
    }

    updateUserPreferences()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [userPreferences])

  // getting game state on mount
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    setLoading(true)

    const getState = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/game/state/${roomId}`, {
          signal: controller.signal,
        })
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

  // updating game history (sending to the db)
  useEffect(() => {
    if (!gameState?.over.length && history.length) {
      sock.emit('updateHistory', { roomId, history })
    }
  }, [history])

  useEffect(() => {
    setCurrentMoveIndex(fenHistory.length)
  }, [fenHistory])

  // updating states
  useEffect(() => {
    waitDrawAnswerRef.current = waitDrawAnswer
  }, [waitDrawAnswer])

  useEffect(() => {
    overRef.current = gameState?.over
  }, [gameState])

  // show end game dialog
  useEffect(() => {
    if (gameState?.over.length && openEndDialog == null) {
      setOpenEndDialog(true)
    }
  }, [gameState])

  const findKingInCheck = () => {
    const kingColor = chess.turn()
    const board = chess.board()

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const piece = board[row][col]
        if (piece && piece.type === 'k' && piece.color === kingColor) {
          // Convert row and col to algebraic notation
          return String.fromCharCode(97 + col) + (8 - row) // e.g., 'e1'
        }
      }
    }
    return null
  }

  // make move logic
  const makeAMove = useCallback(
    (move) => {
      try {
        const result = chess.move(move)
        setFen(chess.fen())
        setHighlightedSquare(null)

        if (result) {
          if (!gameState?.winner.length) {
            setHistory(chess.history())
            // Save the FEN to state
            const currentFEN = chess.fen()
            setFenHistory((prevFenHistory) => [...prevFenHistory, currentFEN])
          }

          if (result.captured) {
            const piece = result.captured
            const color = result.color === 'w' ? 'black' : 'white'
            setCapturedPieces((prev) => ({
              ...prev,
              [color]: [...prev[color], piece],
            }))
            if (gameState?.winner.length) {
              captureSoundPlay.play()
            }
          }
          if (gameState?.winner.length) {
            moveSoundPlay.play()
          }
        }

        // highlighting check or checkmated king
        if (chess.inCheck() || chess.isCheckmate()) {
          console.log('checked')
          const kingSquare = findKingInCheck(chess)
          setHighlightedSquare(kingSquare)
        } else {
          setHighlightedSquare(null)
        }

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
    [currentMoveIndex, fenHistory]
  )

  // promotion logic for click to move piece method
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

  // move logic for drag and drop
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
      promotion: userPreferences?.queenPromotion ? 'q' : piece[1].toLowerCase(),
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

  // move options for click to move method
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

  // click to move logic
  function onSquareClick(square) {
    if (currentMoveIndex !== fenHistory.length) {
      syncToLatestMove()
      return
    }

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

      if (!userPreferences?.queenPromotion) {
        // If it's a promotion move, show the promotion dialog
        if (
          (foundMove.color === 'w' && foundMove.piece === 'p' && square[1] === '8') ||
          (foundMove.color === 'b' && foundMove.piece === 'p' && square[1] === '1')
        ) {
          setShowPromotionDialog(true)
          return
        }
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

  // Socket listener for move updates
  useEffect(() => {
    sock.on('move', (move) => {
      if (fenHistory.length == currentMoveIndex) {
        console.log('moving')
        const m = makeAMove(move)
        if (m?.captured) {
          captureSoundPlay.play()
        } else {
          moveSoundPlay.play()
        }
      } else {
        syncToLatestMove(move)
      }
    })

    return () => {
      sock.off('move')
    }
  }, [sock, fenHistory, currentMoveIndex, makeAMove])

  const syncToLatestMove = (newMove) => {
    console.log('syncing')
    // Make the new move and update the board to the latest state
    chess.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    console.log(history)
    setCapturedPieces({ white: [], black: [] })
    history.forEach((move) => {
      makeAMove(move)
    })

    if (newMove) {
      makeAMove(newMove)
    }

    // Reset the current move index to the last move
    setCurrentMoveIndex(fenHistory.length)
  }

  // General socket listeners
  useEffect(() => {
    const handleOpponentDisconnected = () => {
      console.log('opponent disconnected')
      if (!gameState?.over.length) {
        setOpponentDisconnected(true)
        sock.emit('sendFen', { fen: chess.fen(), roomId })
      }
    }

    const handleOpponentReconnected = () => {
      setOpponentDisconnected(false)
    }

    const handleGameEnd = (data) => {
      if (data.winner.length > 1) {
        endGameSoundPlay.play()
        setGameState((prev) => ({
          ...prev,
          over: data.endState,
          winner: data.winner,
        }))
        setOfferDraw(null)
        setOpponentDisconnected(false)
        setWaitDrawAnswer(false)
      }
    }

    const handleOfferDraw = () => {
      if (waitDrawAnswer) return
      setOfferDraw(true)
    }

    const handleDrawRefused = () => {
      if (!waitDrawAnswerRef.current) return
      toast({
        title: 'Draw refused',
        duration: 2000,
        description: 'Opponent refused taking draw',
      })
      setWaitDrawAnswer(null)
    }

    const handleDisconnect = () => {
      console.log('server stopped')
    }

    // Register listeners
    sock.on('opponentDisconnected', handleOpponentDisconnected)
    sock.on('opponentReconnected', handleOpponentReconnected)
    sock.on('gameEnd', handleGameEnd)
    sock.on('offerDraw', handleOfferDraw)
    sock.on('drawRefused', handleDrawRefused)
    sock.on('disconnect', handleDisconnect)

    // Cleanup listeners on unmount or socket change
    return () => {
      sock.off('opponentDisconnected', handleOpponentDisconnected)
      sock.off('opponentReconnected', handleOpponentReconnected)
      sock.off('gameEnd', handleGameEnd)
      sock.off('offerDraw', handleOfferDraw)
      sock.off('drawRefused', handleDrawRefused)
      sock.off('disconnect', handleDisconnect)
    }
  }, [
    sock,
    gameState?.over.length,
    chess,
    roomId,
    setGameState,
    setOpponentDisconnected,
    setOfferDraw,
    setWaitDrawAnswer,
    waitDrawAnswer,
    toast,
    endGameSoundPlay,
  ])

  // loading game state on mount
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

  // styles for check and checkmate
  const customSquareStyles = {
    ...moveSquares,
    ...optionSquares,
    ...rightClickedSquares,
    ...(highlightedSquare ? { [highlightedSquare]: { backgroundColor: 'rgba(200, 0, 0, 0.3)' } } : {}),
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
              userPreferences={userPreferences}
              setUserPreferences={setUserPreferences}
              fenHistory={fenHistory}
              currentMoveIndex={currentMoveIndex}
              goToFirstMove={goToFirstMove}
              goToPreviousMove={goToPreviousMove}
              goToNextMove={goToNextMove}
              goToLastMove={goToLastMove}
              goToIndexMove={goToIndexMove}
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
              arePremovesAllowed={userPreferences?.premovesAllowed ? allowPremoves : false}
              animationDuration={userPreferences?.pieceSpeedAnimation}
              position={fen}
              arePiecesDraggable={
                (userPreferences?.pieceMoveType == 1 && currentMoveIndex == fenHistory.length) ||
                (userPreferences?.pieceMoveType == 3 && currentMoveIndex == fenHistory.length)
                  ? true
                  : false
              }
              onPieceDrop={onDrop}
              boardOrientation={auth.id === players[0].id ? player1Orientation : player2Orientation}
              onPieceClick={() => {
                !allowPremoves ? setAllowPremoves(true) : null
              }}
              onPieceDragBegin={() => {
                setIsPieceDragged(true)
              }}
              onSquareClick={
                userPreferences?.pieceMoveType == 1 || userPreferences?.pieceMoveType == 2 ? onSquareClick : undefined
              }
              onSquareRightClick={onSquareRightClick}
              onPromotionPieceSelect={
                !isPieceDragged && !userPreferences?.queenPromotion ? onPromotionPieceSelect : undefined
              }
              promotionToSquare={!isPieceDragged && !userPreferences?.queenPromotion ? moveTo : undefined}
              promotionDialogVariant={'modal'}
              showPromotionDialog={!isPieceDragged ? showPromotionDialog : undefined}
              autoPromoteToQueen={userPreferences?.queenPromotion ? true : false}
              customSquareStyles={customSquareStyles}
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
