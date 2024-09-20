// @ts-nocheck

import { Chess } from 'chess.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Cross1Icon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import GameInfo from './GameInfo'
import useAuth from '@/hooks/useAuth'
import { axiosPrivate } from '@/api/axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { Button } from './ui/button'
import pawn from '../assets/pawn.png'
import queen from '../assets/queen.png'
import rook from '../assets/rook.png'

export default function GamePageBoard({ mode, players, moves, setMoves, roomId, orientation, sock }) {
  const player1Orientation = orientation
  const player2Orientation = orientation === 'white' ? 'black' : 'white'
  const { auth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const chess = useMemo(() => new Chess(), [])
  const axiosPrivate = useAxiosPrivate()

  const [loading, setLoading] = useState(false)
  const [fen, setFen] = useState(chess.fen())
  const [over, setOver] = useState('')
  const [playerSide, setPlayerSide] = useState(auth.id == players[0] ? player1Orientation : player2Orientation)
  const [opponentDisconnected, setOpponentDisconnected] = useState(false)
  const [winner, setWinner] = useState('')
  const [useFen, setUseFen] = useState(null)
  const [playerStats, setPlayerStats] = useState([])
  const [onMountCheck, setOnMountCheck] = useState(true)

  // console.log(fen)
  // console.log(chess)
  console.log(winner)
  console.log(over)

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

    if (over.length < 1) {
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
      console.log('opponentDisconnected')
      setOpponentDisconnected(true)
      sock.emit('sendFen', { fen: chess.fen(), roomId })
    })

    sock.on('opponentReconnected', () => {
      setOpponentDisconnected(false)
    })

    sock.on('gameEnd', (data) => {
      console.log('get gameEnd from server', data)

      if (data.winner.length > 1) {
        setOver(data.endState)
        setWinner(data.winner)
      }
    })

    sock.on('useFen', () => {
      setUseFen(true)
    })
  }, [sock])

  useEffect(() => {
    if (useFen) {
      console.log('trying to use fen state')
      let isMounted = true
      const controller = new AbortController()
      setLoading(true)

      const getState = async () => {
        try {
          const response = await axiosPrivate.get(`http://localhost:3000/game/state/${roomId}`, {
            signal: controller.signal,
          })
          isMounted && chess.load(response.data.state)
          setFen(response.data.state)
          setUseFen(null)
          setLoading(false)
        } catch (err) {
          console.error(err)
        }
      }

      getState()

      return () => {
        isMounted = false
        controller.abort()
      }
    }
  }, [useFen])

  useEffect(() => {
    if (onMountCheck) {
      console.log('game state taken')
      let isMounted = true
      const controller = new AbortController()
      setLoading(true)

      const getState = async () => {
        try {
          const response = await axiosPrivate.get(`http://localhost:3000/game/state/${roomId}`, {
            signal: controller.signal,
          })
          console.log('setting winner if possible')
          isMounted && response.data.winner.length > 1 ? setWinner(response.data.winner) : null
          setOver(response.data.endState)

          console.log(response.data.winner, response.data.endState)
          setLoading(false)
          setOnMountCheck(false)
        } catch (err) {
          console.error(err)
        }
      }

      getState()

      return () => {
        isMounted = false
        controller.abort()
      }
    }
  }, [])

  return (
    <>
      <div className="w-full h-full flex items-center pl-20 pr-96 min-h-screen">
        {over.length > 1 ? (
          <>
            <div
              className="absolute top-1/2 left-1/2 h-max w-1/4 z-50 border rounded-md shadow-md bg-white py-6 px-8 flex items-center justify-center"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <div className="w-full h-full">
                <div className="absolute right-3 top-3">
                  <Cross1Icon className="size-10 hover:bg-slate-200 cursor-pointer p-2 rounded-lg" />
                </div>
                <header className="grid gap-6 w-full">
                  <div className="flex items-center justify-center w-full">
                    <div className="grid gap-4 items-center justify-center justify-items-center">
                      <img
                        className="size-36"
                        src={mode == 'bullet' ? rook : mode == 'rapid' ? pawn : mode == 'blitz' ? queen : null}
                        alt="image"
                      />
                      <h1 className="text-4xl text-center">{winner}</h1>
                      <p className="text-l text-center">{over}</p>
                    </div>
                  </div>
                  <p className="text-center text-xl text-ellipsis">
                    <span className="mr-2 text-ellipsis text-center w-full">{playerStats[0]?.name}</span> vs{' '}
                    <span className="ml-2 text-ellipsis text-center w-full">{playerStats[1]?.name}</span>
                  </p>
                </header>
                <main className="grid items-center justify-center pt-8">
                  <div className="flex items-center justify-center gap-8">
                    <Button variant={'outline'} className="w-full">
                      Offer a rematch
                    </Button>
                    <Button variant={'outline'} className="w-full">
                      New {mode} game
                    </Button>
                  </div>
                  <div className="pt-8 grid gap-2">
                    <p className="text-center">
                      You earnd <span>{-25}</span> elo this game
                    </p>
                    <p className="text-center">New raiting is 1250</p>
                  </div>
                </main>
              </div>
            </div>
          </>
        ) : null}
        <div className="w-full h-full pr-24 min-h-screen">
          <div className="min-h-screen h-full w-full flex items-center justify-center min-w-max">
            <GameInfo
              opponentDisconnected={opponentDisconnected}
              mode={mode}
              players={players}
              moves={moves}
              roomId={roomId}
              orientation={orientation}
              sock={sock}
              playerStats={playerStats}
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
