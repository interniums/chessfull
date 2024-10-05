// @ts-nocheck

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Chessboard } from 'react-chessboard'
import { motion } from 'framer-motion'

export default function GameSettings({ userPreferences, setUserPreferences }) {
  return (
    <div className="grid py-2 gap-4 w-full">
      <div>
        <h1 className="font-bold">In game settings</h1>
        <p className="text-sm font-medium text-muted-foreground">change in game settings here</p>
      </div>
      <div className="grid gap-2 w-full">
        <h1 className="font-bold text-start">Piece animation</h1>
        <Select
          value={userPreferences?.pieceSpeedAnimation}
          onValueChange={(value) => {
            setUserPreferences((prev) => ({ ...prev, pieceSpeedAnimation: value }))
          }}
        >
          <SelectTrigger className="font-medium text-l w-full">
            <SelectValue placeholder={userPreferences?.pieceSpeedAnimation} />
          </SelectTrigger>
          <SelectContent className="font-medium text-l w-full">
            <SelectItem value={600}>Slow</SelectItem>
            <SelectItem value={300}>Default</SelectItem>
            <SelectItem value={150}>Fast</SelectItem>
            <SelectItem value={0}>None</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 w-full">
        <h1 className="font-bold text-start">Piece move method</h1>
        <Select
          value={userPreferences?.pieceMoveType}
          onValueChange={(value) => {
            setUserPreferences((prev) => ({ ...prev, pieceMoveType: value }))
          }}
        >
          <SelectTrigger className="font-medium text-l w-full">
            <SelectValue placeholder={userPreferences?.pieceMoveType} />
          </SelectTrigger>
          <SelectContent className="font-medium text-l w-full">
            <SelectItem value={1}>Both click and drag & drop</SelectItem>
            <SelectItem value={2}>Only click</SelectItem>
            <SelectItem value={3}>Only drag and drop</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 w-full">
        <h1 className="font-bold text-start">Allow premoves</h1>
        <Select
          value={userPreferences?.premovesAllowed}
          onValueChange={(value) => {
            setUserPreferences((prev) => ({ ...prev, premovesAllowed: value }))
          }}
        >
          <SelectTrigger className="font-medium text-l w-full">
            <SelectValue placeholder={userPreferences?.premovesAllowed} />
          </SelectTrigger>
          <SelectContent className="font-medium text-l w-full">
            <SelectItem value={true}>Premoves allowed</SelectItem>
            <SelectItem value={false}>Premoves not allowed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 w-full">
        <h1 className="font-bold text-start">Always promote to queen</h1>
        <Select
          value={userPreferences?.queenPromotion}
          onValueChange={(value) => {
            setUserPreferences((prev) => ({ ...prev, queenPromotion: value }))
          }}
        >
          <SelectTrigger className="font-medium text-l w-full">
            <SelectValue placeholder={userPreferences?.queenPromotion} />
          </SelectTrigger>
          <SelectContent className="font-medium text-l w-full">
            <SelectItem value={true}>True</SelectItem>
            <SelectItem value={false}>False</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 w-full">
        <h1 className="font-bold text-start">Choose piece set</h1>
        <Select
          value={userPreferences?.pieceSet}
          onValueChange={(value) => {
            setUserPreferences((prev) => ({ ...prev, pieceSet: value }))
          }}
        >
          <SelectTrigger className="font-medium text-l w-full">
            <SelectValue placeholder={userPreferences?.pieceSet} />
          </SelectTrigger>
          <SelectContent className="font-medium text-l w-full">
            <SelectItem value={'alpha'}>alpha</SelectItem>
            <SelectItem value={'caliente'}>caliente</SelectItem>
            <SelectItem value={'cardinal'}>cardinal</SelectItem>
            <SelectItem value={'cburnett'}>cburnett</SelectItem>
            <SelectItem value={'chessnut'}>chessnut</SelectItem>
            <SelectItem value={'cooke'}>cooke</SelectItem>
            <SelectItem value={'gioco'}>gioco</SelectItem>
            <SelectItem value={'governor'}>governor</SelectItem>
            <SelectItem value={'icpieces'}>icpieces</SelectItem>
            <SelectItem value={'kiwen-suwi'}>kiwen-suwi</SelectItem>
            <SelectItem value={'kosal'}>kosal</SelectItem>
            <SelectItem value={'maestro'}>maestro</SelectItem>
            <SelectItem value={'merida'}>merida</SelectItem>
            <SelectItem value={'monarchy'}>monarchy</SelectItem>
            <SelectItem value={'mpchess'}>mpchess</SelectItem>
            <SelectItem value={'pirouetti'}>pirouetti</SelectItem>
            <SelectItem value={'pixel'}>pixel</SelectItem>
            <SelectItem value={'staunty'}>staunty</SelectItem>
            <SelectItem value={'tatiana'}>tatiana</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 w-full">
        <h1 className="font-bold text-start">Choose board</h1>
        <Select
          value={userPreferences?.board}
          onValueChange={(value) => {
            setUserPreferences((prev) => ({
              ...prev,
              board: value,
            }))
          }}
        >
          <SelectTrigger className="font-medium text-l w-full">
            <SelectValue>{userPreferences?.board.name}</SelectValue>
          </SelectTrigger>
          <SelectContent className="font-medium text-l w-full">
            <SelectItem value={{ lightSquare: '#eeeed2', darkSquare: '#769656', name: 'Green' }}>Green</SelectItem>
            <SelectItem
              value={{
                lightSquare: '#d2b48c',
                darkSquare: '#654321',
                name: 'Dark Wood',
              }}
            >
              Dark Wood
            </SelectItem>
            <SelectItem value={{ lightSquare: '#f7deab', darkSquare: '#b58863', name: 'Brown' }}>Brown</SelectItem>
            <SelectItem
              value={{
                lightSquare: '#e0e4e8',
                darkSquare: '#779ab6',
                name: 'Ice Sea',
              }}
            >
              Ice Sea
            </SelectItem>
            <SelectItem value={{ lightSquare: '#ffffff', darkSquare: '#586e75', name: 'Bases' }}>Bases</SelectItem>
            <SelectItem
              value={{
                lightSquare: 'rgba(255, 255, 255, 0.75)',
                darkSquare: 'rgba(0, 0, 0, 0.6)',
                name: 'Transculent',
              }}
            >
              Translucent
            </SelectItem>
            <SelectItem value={{ lightSquare: '#add8e6', darkSquare: '#4682b4', name: 'Blue' }}>Blue</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
