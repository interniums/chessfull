// @ts-nocheck

import HomePageFooter from './HomePageFooter'
import HomePageHeader from './HomePageHeader'
import pawn from '../assets/pawn.png'
import queen from '../assets/queen.png'
import rook from '../assets/rook.png'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { Button } from './ui/button'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePageMain() {
  const navigate = useNavigate()
  const [game, setGame] = useState('')

  const startGame = () => {
    if (game.length > 1) {
      navigate('/play')
    } else {
      return
    }
  }

  return (
    <main className="h-full">
      <HomePageHeader />
      <div className="w-full h-full items-center content-center justify-center grid">
        <ToggleGroup type="single" className="flex justify-center gap-20">
          <ToggleGroupItem value="bullet" className="h-max py-4 px-8 rounded-md" onClick={() => setGame('bullet')}>
            <div>
              <h1 className="text-2xl text-center">Bullet</h1>
              <img src={rook} alt="pawn" className="size-32" />
              <div>
                <h1 className="text-xl text-center">
                  Rank: <span>A</span>
                </h1>
                <h1 className="text-xl text-center">
                  Elo: <span>2500</span>
                </h1>
              </div>
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem value="blitz" className="h-max py-4 px-8 rounded-md" onClick={() => setGame('blitz')}>
            <div className="">
              <h1 className="text-2xl text-center">Blitz</h1>
              <img src={queen} alt="pawn" className="size-32" />
              <div>
                <h1 className="text-xl text-center">
                  Rank: <span>B</span>
                </h1>
                <h1 className="text-xl text-center">
                  Elo: <span>2100</span>
                </h1>
              </div>
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem onClick={() => setGame('rapid')} value="rapid" className="h-max py-4 px-8 rounded-md">
            <div>
              <h1 className="text-2xl text-center">Rapid</h1>
              <img src={pawn} alt="pawn" className="size-32" />
              <div>
                <h1 className="text-xl text-center">
                  Rank: <span>S</span>
                </h1>
                <h1 className="text-xl text-center">
                  Elo: <span>1200</span>
                </h1>
              </div>
            </div>
          </ToggleGroupItem>
        </ToggleGroup>
        <Button onClick={() => startGame()} className="text-2xl py-6 w-full mt-8" variant={'outline'}>
          {game.length > 1 ? `Find ${game} game` : 'Choose game format'}
        </Button>
      </div>
      <HomePageFooter />
    </main>
  )
}
