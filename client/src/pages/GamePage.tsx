// @ts-nocheck

import HomePageFooter from '@/components/HomePageFooter'
import HomePageHeader from '@/components/HomePageHeader'
import PlayPageBoard from '@/components/GamePageBoard'
import { useLocation } from 'react-router-dom'
import getSocket from '@/socket'

export default function GamePage() {
  const { state } = useLocation()
  const { players, mode } = state
  const sock = getSocket()
  const [moves, setMoves] = useState([])

  useEffect(() => {
    sock.on('opponentMove', (move) => {
      setMoves((prev) => [...prev, move])
    })

    return () => {
      sock.off('opponentMove')
    }
  }, [sock])

  const handleMove = (move) => {
    sock.emit('makeMove', { roomId: state.roomId, move })
    setMoves((prev) => [...prev, move])
  }

  return (
    <>
      <main className="w-full h-full">
        <HomePageHeader variant={'play'} />
        <GamePageBoard mode={mode} players={players} />
        <HomePageFooter />
      </main>
    </>
  )
}
