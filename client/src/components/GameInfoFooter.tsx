// @ts-nocheck

import useAuth from '@/hooks/useAuth'
import { Avatar, AvatarImage } from './ui/avatar'
import { useNavigate } from 'react-router-dom'
import avatar from '../assets/images/avatar.svg'
import queen from '../assets/images/queen.png'
import CapturedPieces from './GameInfoMainCapturedPiece'
import InGameSettings from './InGameSettings'

export default function GameInfoFooter({
  players,
  winner,
  opponentDisconnected,
  capturedPieces,
  orientation,
  player1Orientation,
  player2Orientation,
  userPreferences,
  setUserPreferences,
}) {
  const navigate = useNavigate()
  const { auth } = useAuth()

  return (
    <div className="flex w-full min-h-24 items-center justify-center">
      <div className="text-center w-full">
        <div className="text-center mb-2">
          <span className="font-bold">{players[0].id == auth.id ? players[0]?.elo : players[1]?.elo}</span> elo
        </div>
        <hr className="mb-2" />
        <div className="flex justify-between px-6">
          <div className="flex items-center justify-start">
            <Avatar
              className="cursor-pointer w-10 h-10"
              onClick={() => {
                navigate(`/profile/${players[0].id == auth.id ? players[0]?.elo : players[1]?.elo}`)
              }}
            >
              <AvatarImage className="p-1.5" src={avatar} />
            </Avatar>
            <div
              onClick={() => {
                navigate(`/profile/${players[0].id == auth.id ? players[0]?.id : players[1]?.id}`)
              }}
              className="px-4 text-l text-ellipsis cursor-pointer flex items-center justify-center font-medium"
              style={{
                textDecoration: winner === auth.id ? 'underline green' : 'none',
              }}
            >
              {players[0].id == auth.id ? players[0]?.name : players[1]?.name}
              <div className="ml-2"></div>
            </div>
          </div>
          <InGameSettings userPreferences={userPreferences} setUserPreferences={setUserPreferences} />
        </div>
        <CapturedPieces
          color={auth?.id == players[0].id ? player2Orientation : player1Orientation}
          capturedPieces={capturedPieces}
        />
      </div>
    </div>
  )
}
