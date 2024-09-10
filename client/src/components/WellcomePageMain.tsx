// @ts-nocheck

import { Button } from './ui/button'
import mainImage from '../assets/main-imge.jpg'
import { Link } from 'react-router-dom'
import HomePageHeader from './HomePageHeader'
import rook from '../assets/rook.png'
import pawn from '../assets/pawn.png'
import queen from '../assets/queen.png'
import bishop from '../assets/bishop.png'
import knight from '../assets/knight.png'

export default function WellcomePageMain() {
  return (
    <main className="w-full h-full items-center flex justify-center">
      <HomePageHeader />
      <div className="grid gap-6 h-min items-center mt-36 w-3/5 justify-center">
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
        <Button className="rounded-sm text-2xl py-6" variant={'outline'}>
          Play fast game
        </Button>
      </div>
    </main>
  )
}
