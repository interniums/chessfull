// @ts-nocheck

import { Button } from './ui/button'
import mainImage from '../assets/images/main-imge.jpg'
import { Link, useLocation } from 'react-router-dom'
import HomePageHeader from './HomePageHeader'
import rook from '../assets/images/rook.png'
import pawn from '../assets/images/pawn.png'
import queen from '../assets/images/queen.png'
import bishop from '../assets/images/bishop.png'
import knight from '../assets/images/knight.png'

export default function WellcomePageMain() {
  return (
    <main className="w-full h-full items-center flex justify-center">
      <HomePageHeader />
      <div className="grid gap-6 h-min items-center w-3/5 justify-center">
        <div className="flex items-center justify-center">
          <img src={rook} alt="rook" className="size-24" />
          <img src={pawn} alt="rook" className="size-28" />
          <img src={queen} alt="rook" className="size-36" />
          <img src={knight} alt="rook" className="size-28" />
          <img src={bishop} alt="rook" className="size-24" />
        </div>
        <h1 className="text-center text-xl text-gray-700">
          "Chessfull is free chess platform, that aims for the best user experience. Designed to enjoy chess."
        </h1>
        <Link to={'/login'} className="w-full">
          <Button variant={'outline'} className="w-full rounded-sm text-2xl py-6">
            Login
          </Button>
        </Link>
      </div>
    </main>
  )
}
