// @ts-nocheck

import useAuth from '@/hooks/useAuth'
import { AvatarImage } from './ui/avatar'
import { Avatar } from '@radix-ui/react-avatar'
import { useNavigate } from 'react-router-dom'
import avatar from '../assets/images/avatar.svg'
import queen from '../assets/images/queen.png'
import CapturedPieces from './GameInfoMainCapturedPiece'
import { GearIcon } from '@radix-ui/react-icons'

export default function GameInfoHeader({
  players,
  winner,
  opponentDisconnected,
  capturedPieces,
  orientation,
  player1Orientation,
  player2Orientation,
}) {
  const navigate = useNavigate()
  const { auth } = useAuth()

  return (
    <div className="flex w-full min-h-32 items-center justify-center">
      <div className="text-center w-full px-6">
        <div className="flex justify-between">
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
              className="px-4 text-l text-ellipsis cursor-pointer flex items-center justify-center gap-2 font-medium"
              style={{
                textDecoration: winner !== auth.id && winner !== 'Draw' && winner.length ? 'underline green' : 'none',
              }}
            >
              {players[0].id == auth.id ? players[1]?.name : players[0]?.name}
            </div>
          </div>
        </div>
        <CapturedPieces
          color={auth?.id == players[0].id ? player1Orientation : player2Orientation}
          capturedPieces={capturedPieces}
        />
        {opponentDisconnected && <h1 className="text-red-400 animate-pulse">Waiting for opponent to connect...</h1>}
        <hr className="mt-2" />
        <div className="text-center mt-2">
          <span className="font-bold">{players[0].id == auth.id ? players[1]?.elo : players[0]?.elo}</span> elo{' '}
        </div>
      </div>
    </div>
  )
}
