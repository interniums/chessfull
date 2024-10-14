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
import move from '../assets/sounds/move.mp3'
import capture from '../assets/sounds/capture.mp3'
import endGame from '../assets/sounds/endGame.mp3'
import UIfx from 'uifx'
import { useLocation } from 'react-router-dom'

export default function GamePageBoard({ mode, players, moves, setMoves, roomId, orientation, sock }) {
  const player1Orientation = orientation
  const player2Orientation = orientation === 'white' ? 'black' : 'white'

  // sounds
  const moveSoundPlay = new UIfx(move, {
    volume: 1,
  })
  const captureSoundPlay = new UIfx(capture, {
    volume: 1,
  })
  const endGameSoundPlay = new UIfx(endGame, {
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
  // timers
  const [whiteTime, setWhiteTime] = useState(300)
  const [blackTime, setBlackTime] = useState(300)
  const [activePlayer, setActivePlayer] = useState('white')
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1280)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1280)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const waitDrawAnswerRef = useRef(waitDrawAnswer)
  const overRef = useRef(gameState?.over)
  const isFirstRender = useRef(true)

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

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const updateUserPreferences = async () => {
      try {
        const response = await axiosPrivate.patch(
          `https://chessfull-production.up.railway.app/user/update/preferences`,
          {
            signal: controller.signal,
            pieceSpeedAnimation: userPreferences?.pieceSpeedAnimation,
            pieceMoveType: userPreferences?.pieceMoveType,
            premovesAllowed: userPreferences?.premovesAllowed,
            queenPromotion: userPreferences?.queenPromotion,
            pieceSet: userPreferences?.pieceSet,
            board: userPreferences?.board,
            id: auth.id,
          }
        )

        console.log('user preferences updated')
      } catch (err) {
        console.error(err)
      }
    }

    // Prevent function call on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      updateUserPreferences()
    }

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [userPreferences])

  // get user preferences
  useEffect(() => {
    setLoading(true)
    let isMounted = true
    const controller = new AbortController()

    const getUserPreferences = async () => {
      try {
        const response = await axiosPrivate.get(
          `https://chessfull-production.up.railway.app/user/${auth?.id}/getPreferences`,
          {
            signal: controller.signal,
          }
        )
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

  // getting game state on mount
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    setLoading(true)

    const getState = async () => {
      try {
        const response = await axiosPrivate.get(`https://chessfull-production.up.railway.app/game/state/${roomId}`, {
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
    // Set the square background color to light orange
    const squareBackgroundStyle = {
      backgroundColor: 'rgba(255, 165, 0, 0.5)', // Light orange background
    }

    // Toggle the background color for the clicked square
    setRightClickedSquares((prevState) => ({
      ...prevState,
      [square]: prevState[square]
        ? undefined // Remove the highlight if already clicked
        : squareBackgroundStyle, // Apply the light orange background
    }))

    // Reset other states
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
    sock.on('timerUpdate', (data) => {
      setWhiteTime(data.whiteTime)
      setBlackTime(data.blackTime)
      setActivePlayer(data.activePlayer)
    })

    // Cleanup listeners on unmount or socket change
    return () => {
      sock.off('opponentDisconnected', handleOpponentDisconnected)
      sock.off('opponentReconnected', handleOpponentReconnected)
      sock.off('gameEnd', handleGameEnd)
      sock.off('offerDraw', handleOfferDraw)
      sock.off('drawRefused', handleDrawRefused)
      sock.off('disconnect', handleDisconnect)
      sock.off('timerUpdate')
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
    ...(highlightedSquare ? { [highlightedSquare]: { backgroundColor: 'rgba(255, 0, 0, 0.6)' } } : {}),
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK']
  const customPieces = useMemo(() => {
    const pieceComponents = {}
    pieces.forEach((piece) => {
      pieceComponents[piece] = ({ squareWidth }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(/assets/piece/${userPreferences?.pieceSet}/${piece}.svg)`,
            backgroundSize: '100%',
          }}
        />
      )
    })
    return pieceComponents
  }, [userPreferences])

  return (
    <>
      <div className="w-full xl:h-full xl:flex block items-center pl-0 xl:pl-20 xl:pr-96 pr-0 xl:min-h-screen justify-center xl:justify-normal">
        {openEndDialog ? (
          <GameEndDialog
            setOpenEndDialog={setOpenEndDialog}
            players={players}
            gameState={gameState}
            mode={mode}
            loading={loading}
          />
        ) : null}
        {isSmallScreen ? null : (
          <div className="w-0 h-0 xl:w-full xl:h-full xl:pr-24 xl:min-h-screen">
            <div className="xl:min-h-screen xl:h-full w-full flex items-start justify-center xl:min-w-max xl:py-24">
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
                isSmallScreen={isSmallScreen}
              />
            </div>
          </div>
        )}
        <div
          className={
            !isSmallScreen ? 'xl:h-full xl:min-h-screen' : 'xl:h-full xl:min-h-screen w-full justify-center h-100%'
          }
          style={{ maxWidth: !isSmallScreen ? '85vh' : '', width: !isSmallScreen ? '85vh' : '100%' }}
        >
          <div className="w-full flex items-center justify-center gap-8 pt-16 xl:mt-8 xl:pt-0 xl:mb-6 mb-4">
            <div
              className={
                chess.turn() === 'w' && !gameState?.winner.length
                  ? 'text-2xl p-2 rounded-md bg-green-200'
                  : 'text-2xl p-2 rounded-md'
              }
            >
              W {formatTime(whiteTime)}
            </div>
            <div className="text-2xl">|</div>
            <div
              className={
                chess.turn() === 'b' && !gameState?.winner.length
                  ? 'text-2xl p-2 rounded-md bg-green-200'
                  : 'text-2xl p-2 rounded-md'
              }
            >
              B {formatTime(blackTime)}
            </div>
          </div>
          <div
            className={
              !isSmallScreen
                ? 'board h-fit rounded-md flex items-center justify-center'
                : 'board h-fit rounded-md flex items-center'
            }
            style={{
              maxWidth: !isSmallScreen ? '85vh' : '',
              width: !isSmallScreen ? '85vh' : '100%',
              maxHeight: '80vh',
              boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 10px',
            }}
          >
            <Chessboard
              customLightSquareStyle={{
                backgroundColor: userPreferences.board ? userPreferences?.board.lightSquare : null,
              }}
              customDarkSquareStyle={{
                backgroundColor: userPreferences.board ? userPreferences?.board.darkSquare : null,
              }}
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
              customPieces={customPieces}
            />
          </div>
        </div>
        {isSmallScreen ? (
          <div className="w-full xl:w-full xl:h-full xl:pr-24 xl:min-h-screen">
            <div className="xl:min-h-screen xl:h-full w-full flex items-start justify-center xl:min-w-max xl:py-24">
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
                isSmallScreen={isSmallScreen}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
