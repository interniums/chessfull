// @ts-nocheck

import { useEffect, useState } from 'react'
import rank1 from '../assets/frame1.png'
import rank2 from '../assets/frame2.png'
import rank3 from '../assets/frame3.png'
import rank4 from '../assets/frame4.png'
import rank5 from '../assets/frame5.png'
import rank6 from '../assets/frame6.png'
import avatar from '../assets/avatar.svg'
import pawn from '../assets/pawn.png'
import queen from '../assets/queen.png'
import plus from '../assets/plus-square-svgrepo-com.svg'
import rook from '../assets/rook.png'
import chat from '../assets/chat-round-unread-svgrepo-com.svg'
import stats from '../assets/stats-svgrepo-com.svg'
import mostWinsDueTo from '../assets/checkmate-svgrepo-com.svg'
import totalGames from '../assets/games-svgrepo-com.svg'
import joined from '../assets/group-svgrepo-com.svg'
import winrate from '../assets/win-svgrepo-com.svg'
import { axiosPrivate } from '@/api/axios'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import useAuth from '@/hooks/useAuth'
import { PlusCircledIcon, ReloadIcon } from '@radix-ui/react-icons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom'

export default function ProfilePageMain() {
  const { id } = useParams()
  const axiosPrivate = useAxiosPrivate()
  const { auth } = useAuth()
  const [loading, setLoading] = useState(true)
  const [statsSelection, setStatsSelection] = useState('Blitz')
  const [playerStats, setPlayerStats] = useState({})
  console.log(playerStats)

  useEffect(() => {
    setLoading(true)
    let isMounted = true
    const controller = new AbortController()

    const getProfileStats = async () => {
      try {
        const response = await axiosPrivate.get(`http://localhost:3000/user/${id}/profile`, {
          signal: controller.signal,
        })
        console.log(response)
        isMounted && setPlayerStats(response.data)
        setLoading(false)
      } catch (err) {
        console.error(err)
      }
    }

    getProfileStats()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  return (
    <div className="w-full h-full py-24 px-12">
      {loading ? (
        <main className="inset-0 absolute z-50 bg-white flex items-center justify-center">
          <div className="grid gap-6">
            <ReloadIcon className="animate-spin size-56" />
            <h1 className="text-center text-3xl">Loading...</h1>
          </div>
        </main>
      ) : (
        <>
          <header className="w-full flex items-center justify-center">
            <div className="flex items-center justify-start w-full">
              <div className="grid items-center justify-center p-4 gap-8 w-full">
                <div className="flex items-center justify-center w-full">
                  {/* <img className="size-12" src={rankAvatar} alt="avatar" /> */}
                  <div className="flex items-end justify-centers text-4xl text-center gap-3">
                    <div>{playerStats?.name}</div>
                    <div className="hover:scale-105 transition-transform cursor-pointer active:scale-90">
                      <img src={plus} className="size-9" alt="add friend" title="add friend" />
                    </div>
                    <div className="hover:scale-105 transition-transform cursor-pointer active:scale-90">
                      <img src={chat} className="size-9" alt="chat" title="send message" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-12 items-start justify-center w-full">
                  <div className="grid items-center justify-center">
                    <div className="flex items-center justify-center">
                      <img className="size-12" src={joined} alt="joined" title="joined" />
                    </div>
                    <div className="text-center text-xl">{playerStats?.joined}</div>
                  </div>
                  <div className="grid items-center justify-center">
                    <div className="flex items-center justify-center">
                      <img src={totalGames} alt="total" className="size-12" title="total games" />
                    </div>
                    <div className="text-center text-xl">{playerStats?.gamesPlayed}</div>
                  </div>
                  <div className="grid items-center justify-center">
                    <div className="flex items-center justify-center">
                      <img src={winrate} alt="winrate" className="size-12" title="winrate" />
                    </div>
                    <div className="text-center text-xl">{playerStats?.winPrecentage}%</div>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="grid w-full items-center justify-center p-10">
            <div className="w-full h-full grid gap-8 bg-slate-100 rounded-2xl py-6 px-20 shadow-md items-center justify-center">
              <div className="w-full flex items-center justify-center">
                <Select onValueChange={setStatsSelection}>
                  <SelectTrigger>
                    <SelectValue placeholder={statsSelection} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bullet">Bullet</SelectItem>
                    <SelectItem value="Blitz">Blitz</SelectItem>
                    <SelectItem value="Rapid">Rapid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid items-center justify-center">
                <div className="flex items-center justify-center mb-4">
                  <img
                    className="size-36"
                    src={
                      statsSelection === 'Bullet'
                        ? rook
                        : statsSelection === 'Blitz'
                        ? queen
                        : statsSelection === 'Rapid'
                        ? pawn
                        : null
                    }
                    alt="piece"
                    title="gamemode"
                  />
                </div>
                <div className="flex items-center justify-center gap-10 mt-10">
                  <div className="grid items-center justify-center gap-2">
                    <p className="text-2xl text-center">Total games</p>
                    <p className="text-center text-xl">
                      {statsSelection == 'Blitz'
                        ? playerStats?.blitzGames
                        : statsSelection == 'Bullet'
                        ? playerStats?.bulletGames
                        : statsSelection == 'Rapid'
                        ? playerStats?.rapidGames
                        : null}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-10 mt-10">
                  <div className="flex items-center justify-center gap-4">
                    <img src={winrate} alt="winrate" title="winrate" className="size-10" />
                    <p className="text-center text-xl">
                      {' '}
                      {statsSelection == 'Blitz'
                        ? playerStats?.blitzWinPrecentage + '%'
                        : statsSelection == 'Bullet'
                        ? playerStats?.bulletWinPrecentage + '%'
                        : statsSelection == 'Rapid'
                        ? playerStats?.rapidWinPrecentage + '%'
                        : null}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <img src={stats} alt="winrate" title="elo" className="size-10" />
                    <p className="text-center text-xl">
                      {statsSelection == 'Blitz'
                        ? playerStats?.blitzElo
                        : statsSelection == 'Bullet'
                        ? playerStats?.bulletElo
                        : statsSelection == 'Rapid'
                        ? playerStats?.rapidElo
                        : null}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  )
}
