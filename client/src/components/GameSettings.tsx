// @ts-nocheck

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Chessboard } from 'react-chessboard'
import { motion } from 'framer-motion'

export default function GameSettings({ userPreferences, setUserPreferences }) {
  return (
    <div className="grid py-2 gap-4 w-full">
      <div>
        <h1 className="font-bold text-lg">In game settings</h1>
        <p className="text-md font-medium text-muted-foreground">change in game settings here</p>
      </div>
      <div className="grid gap-2 w-full">
        <h1 className="font-bold text-start text-lg">Piece animation</h1>
        <Select
          value={userPreferences?.pieceSpeedAnimation}
          onValueChange={(value) => {
            setUserPreferences((prev) => ({ ...prev, pieceSpeedAnimation: value }))
          }}
        >
          <SelectTrigger className="font-medium text-lg w-full">
            <SelectValue placeholder={userPreferences?.pieceSpeedAnimation} />
          </SelectTrigger>
          <SelectContent className="font-medium w-full">
            <SelectItem value={600} className="text-lg">
              Slow
            </SelectItem>
            <SelectItem className="text-lg" value={300}>
              Default
            </SelectItem>
            <SelectItem className="text-lg" value={150}>
              Fast
            </SelectItem>
            <SelectItem className="text-lg" value={0}>
              None
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 w-full">
        <h1 className="font-bold text-start text-lg">Piece move method</h1>
        <Select
          value={userPreferences?.pieceMoveType}
          onValueChange={(value) => {
            setUserPreferences((prev) => ({ ...prev, pieceMoveType: value }))
          }}
        >
          <SelectTrigger className="font-medium text-lg w-full">
            <SelectValue placeholder={userPreferences?.pieceMoveType} />
          </SelectTrigger>
          <SelectContent className="font-medium w-full">
            <SelectItem className="text-lg" value={1}>
              Both click and drag & drop
            </SelectItem>
            <SelectItem className="text-lg" value={2}>
              Only click
            </SelectItem>
            <SelectItem className="text-lg" value={3}>
              Only drag and drop
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 w-full">
        <h1 className="font-bold text-start text-lg">Allow premoves</h1>
        <Select
          value={userPreferences?.premovesAllowed}
          onValueChange={(value) => {
            setUserPreferences((prev) => ({ ...prev, premovesAllowed: value }))
          }}
        >
          <SelectTrigger className="font-medium text-lg w-full">
            <SelectValue placeholder={userPreferences?.premovesAllowed} />
          </SelectTrigger>
          <SelectContent className="font-medium w-full">
            <SelectItem className="text-lg" value={true}>
              Premoves allowed
            </SelectItem>
            <SelectItem className="text-lg" value={false}>
              Premoves not allowed
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 w-full">
        <h1 className="font-bold text-start text-lg">Always promote to queen</h1>
        <Select
          value={userPreferences?.queenPromotion}
          onValueChange={(value) => {
            setUserPreferences((prev) => ({ ...prev, queenPromotion: value }))
          }}
        >
          <SelectTrigger className="font-medium text-lg w-full">
            <SelectValue placeholder={userPreferences?.queenPromotion} />
          </SelectTrigger>
          <SelectContent className="font-medium w-full">
            <SelectItem className="text-lg" value={true}>
              True
            </SelectItem>
            <SelectItem className="text-lg" value={false}>
              False
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 w-full">
        <h1 className="font-bold text-start text-lg">Choose piece set</h1>
        <Select
          value={userPreferences?.pieceSet}
          onValueChange={(value) => {
            setUserPreferences((prev) => ({ ...prev, pieceSet: value }))
          }}
        >
          <SelectTrigger className="font-medium text-lg w-full">
            <SelectValue placeholder={userPreferences?.pieceSet} />
          </SelectTrigger>
          <SelectContent className="font-medium w-full">
            <SelectItem className="text-lg" value={'alpha'}>
              alpha
            </SelectItem>
            <SelectItem className="text-lg" value={'caliente'}>
              caliente
            </SelectItem>
            <SelectItem className="text-lg" value={'cardinal'}>
              cardinal
            </SelectItem>
            <SelectItem className="text-lg" value={'cburnett'}>
              cburnett
            </SelectItem>
            <SelectItem className="text-lg" value={'chessnut'}>
              chessnut
            </SelectItem>
            <SelectItem className="text-lg" value={'cooke'}>
              cooke
            </SelectItem>
            <SelectItem className="text-lg" value={'gioco'}>
              gioco
            </SelectItem>
            <SelectItem className="text-lg" value={'governor'}>
              governor
            </SelectItem>
            <SelectItem className="text-lg" value={'icpieces'}>
              icpieces
            </SelectItem>
            <SelectItem className="text-lg" value={'kiwen-suwi'}>
              kiwen-suwi
            </SelectItem>
            <SelectItem className="text-lg" value={'kosal'}>
              kosal
            </SelectItem>
            <SelectItem className="text-lg" value={'maestro'}>
              maestro
            </SelectItem>
            <SelectItem className="text-lg" value={'merida'}>
              merida
            </SelectItem>
            <SelectItem className="text-lg" value={'monarchy'}>
              monarchy
            </SelectItem>
            <SelectItem className="text-lg" value={'mpchess'}>
              mpchess
            </SelectItem>
            <SelectItem className="text-lg" value={'pirouetti'}>
              pirouetti
            </SelectItem>
            <SelectItem className="text-lg" value={'pixel'}>
              pixel
            </SelectItem>
            <SelectItem className="text-lg" value={'staunty'}>
              staunty
            </SelectItem>
            <SelectItem className="text-lg" value={'tatiana'}>
              tatiana
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 w-full">
        <h1 className="font-bold text-start text-lg">Choose board</h1>
        <Select
          value={userPreferences?.board}
          onValueChange={(value) => {
            setUserPreferences((prev) => ({
              ...prev,
              board: value,
            }))
          }}
        >
          <SelectTrigger className="font-medium text-lg w-full">
            <SelectValue>{userPreferences?.board.name}</SelectValue>
          </SelectTrigger>
          <SelectContent className="font-medium w-full">
            <SelectItem className="text-lg" value={{ lightSquare: '#eeeed2', darkSquare: '#769656', name: 'Green' }}>
              Green
            </SelectItem>
            <SelectItem
              className="text-lg"
              value={{
                lightSquare: '#d2b48c',
                darkSquare: '#654321',
                name: 'Dark Wood',
              }}
            >
              Dark Wood
            </SelectItem>
            <SelectItem className="text-lg" value={{ lightSquare: '#f7deab', darkSquare: '#b58863', name: 'Brown' }}>
              Brown
            </SelectItem>
            <SelectItem
              className="text-lg"
              value={{
                lightSquare: '#e0e4e8',
                darkSquare: '#779ab6',
                name: 'Ice Sea',
              }}
            >
              Ice Sea
            </SelectItem>
            <SelectItem className="text-lg" value={{ lightSquare: '#ffffff', darkSquare: '#586e75', name: 'Bases' }}>
              Bases
            </SelectItem>
            <SelectItem
              className="text-lg"
              value={{
                lightSquare: 'rgba(255, 255, 255, 0.75)',
                darkSquare: 'rgba(0, 0, 0, 0.6)',
                name: 'Transculent',
              }}
            >
              Translucent
            </SelectItem>
            <SelectItem className="text-lg" value={{ lightSquare: '#add8e6', darkSquare: '#4682b4', name: 'Blue' }}>
              Blue
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
