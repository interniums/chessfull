// @ts-nocheck

import bP from '../assets/images/pawn.png'
import bR from '../assets/images/rook.png'
import bK from '../assets/images/knight.png'
import bB from '../assets/images/bishop.png'
import bQ from '../assets/images/queen.png'

import wP from '../assets/images/pawn white.png'
import wR from '../assets/images/rook white.png'
import wK from '../assets/images/knight white.png'
import wB from '../assets/images/bishop white.png'
import wQ from '../assets/images/queen white.png'

import { useEffect, useState } from 'react'

const pieceValues = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
}
const pieceIconsBlack = {
  p: bP,
  r: bR,
  n: bK,
  b: bB,
  q: bQ,
}

const pieceIconsWhite = {
  p: wP,
  r: wR,
  n: wK,
  b: wB,
  q: wQ,
}

export default function CapturedPieces({ color, capturedPieces }) {
  const [capturedPiecesEdited, setCapturedPiecesEdited] = useState({ white: [], black: [] })
  const [pieceDifferenceBlack, setPieceDifferenceBlack] = useState(0)
  const [pieceDifferenceWhite, setPieceDifferenceWhite] = useState(0)

  const countPieceDifference = () => {
    let whiteDifference = 0
    let blackDifference = 0

    const calculateDifference = () => {
      const piecesWhite = capturedPieces.white
      piecesWhite.forEach((piece) => {
        whiteDifference += pieceValues[piece] || 0
      })
      const piecesBlack = capturedPieces.black
      piecesBlack.forEach((piece) => {
        blackDifference += pieceValues[piece] || 0
      })
    }

    calculateDifference()

    setPieceDifferenceBlack(blackDifference)
    setPieceDifferenceWhite(whiteDifference)
  }

  useEffect(() => {
    setCapturedPiecesEdited(capturedPieces)

    countPieceDifference()

    if (capturedPiecesEdited.white.length > 4) {
      const result = capturedPieces.white.slice(-5)
      setCapturedPiecesEdited((prev) => ({ ...prev, white: result }))
    }
    if (capturedPiecesEdited.black.length > 4) {
      const result = capturedPieces.black.slice(-5)
      setCapturedPiecesEdited((prev) => ({ ...prev, black: result }))
    }
  }, [capturedPieces])

  return (
    <div>
      {color === 'white' ? (
        <div className="flex items-center justify-center">
          {capturedPiecesEdited?.white.map((piece, index) => (
            <div key={index}>
              <img src={pieceIconsWhite[piece]} className="size-6"></img>
            </div>
          ))}
          <div className="text-center ml-2">
            {pieceDifferenceWhite > pieceDifferenceBlack ? ' + ' + (pieceDifferenceWhite - pieceDifferenceBlack) : null}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center ">
          {capturedPiecesEdited?.black.map((piece, index) => (
            <div key={index}>
              <img src={pieceIconsBlack[piece]} className="size-6"></img>
            </div>
          ))}
          <div className="text-center ml-2">
            {pieceDifferenceBlack > pieceDifferenceWhite ? ' + ' + (pieceDifferenceBlack - pieceDifferenceWhite) : null}
          </div>
        </div>
      )}
    </div>
  )
}
