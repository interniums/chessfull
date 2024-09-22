// @ts-nocheck

import { Chess } from 'chess.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Cross1Icon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { axiosPrivate } from '@/api/axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
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
  const navigate = useNavigate()
  const location = useLocation()
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
  const [playerSide, setPlayerSide] = useState(auth.id == players[0] ? player1Orientation : player2Orientation)
  const [opponentDisconnected, setOpponentDisconnected] = useState(false)
  const [playerStats, setPlayerStats] = useState([])
  const [offerDraw, setOfferDraw] = useState(null)
  const [waitDrawAnswer, setWaitDrawAnswer] = useState(null)
  const [openEndDialog, setOpenEndDialog] = useState(null)
  const [loading, setLoading] = useState(false)

  const waitDrawAnswerRef = useRef(waitDrawAnswer)
  const overRef = useRef(gameState?.over)

  console.log(fen)
  // console.log(history)
  // console.log(gameState)

  useEffect(() => {
    if (!gameState?.over.length) sock.emit('updateHistory', { roomId, history })
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
    }
  }, [])

  const makeAMove = useCallback(
    (move) => {
      try {
        const result = chess.move(move)
        setFen(chess.fen())
        setHistory(chess.history())

        console.log('over, checkmate', chess.isGameOver(), chess.isCheckmate())

        if (chess.isGameOver()) {
          if (chess.isCheckmate() && !gameState?.winner.length) {
            setGameState((prev) => ({ ...prev, over: `Checkmate! ${chess.turn() === 'w' ? 'black' : 'white'} wins!` }))
          } else if (chess.isDraw() && !gameState?.winner.length) {
            setGameState((prev) => ({ ...prev, over: `Draw` }))
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
    if (!overRef.current.length) {
      if (chess.turn() !== playerSide[0]) {
        console.log('no')
        return false
      }
    }

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: 'q',
    }

    const move = makeAMove(moveData)

    // illegal move
    if (move === null) return false

    if (gameState?.over.length < 1) {
      sock.emit('move', {
        move,
        roomId,
        fen: chess.fen(),
      })
    }

    return true
  }

  useEffect(() => {
    sock.on('move', (move) => {
      makeAMove(move)
    })
  }, [makeAMove])

  useEffect(() => {
    sock.on('opponentDisconnected', () => {
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

  useEffect(() => {
    if (playerStats.length < 2) {
      let isMounted = true
      const controller = new AbortController()
      setLoading(true)

      const getUsers = async () => {
        try {
          players.forEach(async (playerID) => {
            const response = await axiosPrivate.get(`http://localhost:3000/user/${playerID}`, {
              signal: controller.signal,
            })
            isMounted &&
              setPlayerStats((prev) => [
                ...prev,
                {
                  name: response.data.name,
                  elo:
                    mode == 'blitz'
                      ? response.data.blitzElo
                      : mode === 'rapid'
                      ? response.data.rapidElo
                      : mode == 'bullet'
                      ? response.data.bulletElo
                      : null,
                },
              ])
            setLoading(false)
          })
        } catch (err) {
          console.error(err)
        }
      }

      getUsers()

      return () => {
        isMounted = false
        controller.abort()
        setLoading(false)
      }
    }
  }, [])

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
            playerStats={playerStats}
            gameState={gameState}
            mode={mode}
          />
        ) : null}
        <div className="w-full h-full pr-24 min-h-screen">
          <div className="min-h-screen h-full w-full flex items-start justify-center min-w-max py-24">
            <GameInfo
              opponentDisconnected={opponentDisconnected}
              mode={mode}
              players={players}
              moves={moves}
              roomId={roomId}
              orientation={orientation}
              sock={sock}
              playerStats={playerStats}
              offerDraw={offerDraw}
              setOfferDraw={setOfferDraw}
              waitDrawAnswer={waitDrawAnswer}
              setWaitDrawAnswer={setWaitDrawAnswer}
              over={gameState?.over}
              winner={gameState?.winner}
            />
          </div>
        </div>
        <div className="grid gap-1 h-full min-h-screen" style={{ maxWidth: '85vh', width: '85vh' }}>
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
