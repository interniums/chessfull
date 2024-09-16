// @ts-nocheck

import { ArrowLeftIcon, ArrowRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import { axiosPrivate } from '@/api/axios'
import { useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'

export default function GameInfo({ mode, players }) {
  const [loading, setLoading] = useState(false)
  const axiosPrivate = useAxiosPrivate()
  const [game, setGame] = useState(true)
  const [playerStats, setPlayerStats] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    setLoading(true)

    const getUsers = async () => {
      try {
        players.forEach(async (playerID) => {
          const response = await axiosPrivate.post(
            'http://localhost:3000/user/findUser',
            { id: playerID },
            { signal: controller.signal }
          )
          console.log(response.data)
          isMounted &&
            setPlayerStats((prev) => [
              ...prev,
              {
                name: response.data.name,
                elo:
                  mode == 'blitz'
                    ? response.data.blitzElo
                    : mode === 'rapid'
                    ? response.data.rapidElo
                    : mode == 'bullet'
                    ? response.data.bulletElo
                    : null,
              },
            ])
          setLoading(false)
        })
      } catch {
        console.error(err)
        navigate('/login', { state: { from: location }, replace: true })
      }
    }

    getUsers()

    return () => {
      isMounted = false
      controller.abort()
      setLoading(false)
    }
  }, [])

  return (
    <div className="w-full border-2 rounded-md py-2 grid content-between">
      {loading ? (
        <div>loading</div>
      ) : (
        <>
          <div className="w-full h-full">
            <div className="text-center">
              <h1 className="px-4 text-l text-ellipsis">
                <span className="font-bold">GM </span>
                {playerStats[0]?.name}
              </h1>
              <hr className="mt-2" />
              <div className="text-center mt-2">
                <span className="font-bold">{playerStats[0]?.elo}</span> elo
              </div>
            </div>
          </div>
          <div className="w-full px-6 max-h-full h-full">
            <div className="w-full flex items-center justify-center gap-8">
              <div>
                <DoubleArrowLeftIcon className="size-8 rounded cursor-pointer hover:bg-slate-300 py-1 px-1" />
              </div>
              <div>
                <ArrowLeftIcon className="size-8 rounded cursor-pointer hover:bg-slate-300 py-1 px-1" />
              </div>
              <div className="cursor-pointer">
                <ArrowRightIcon className="size-8 rounded cursor-pointer hover:bg-slate-300 py-1 px-1" />
              </div>
              <div className="cursor-pointer">
                <DoubleArrowRightIcon className="size-8 rounded cursor-pointer hover:bg-slate-300 py-1 px-1" />
              </div>
            </div>
            <div className="flex py-4 w-full max-h-64 overflow-y-auto items-start">
              <div className="border-r w-min pr-2">
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div>6</div>
                <div>7</div>
                <div>8</div>
                <div>9</div>
                <div>10</div>
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div>6</div>
                <div>7</div>
                <div>8</div>
                <div>9</div>
                <div>10</div>
              </div>
              <div className="flex w-full px-2 justify-center items-center">
                <div className="w-full">
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">f4</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">e5</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">g6</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">0-0</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">f8</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">e2</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">f1</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">g3</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">h9</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">f2</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">f4</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">e5</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">g6</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">0-0</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">f8</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">e2</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">f1</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">g3</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">h9</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">f2</div>
                </div>
                <div className="w-full">
                  <div className="text-center hover:bg-slate-300 cursor-pointer">h9</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer">f4</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer">e5</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer">g6</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer">e2</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer">f1</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer">0-0</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer">f2</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer">g3</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer">f8</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">f4</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">e5</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">g6</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">0-0</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">f8</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">e2</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">f1</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">g3</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">h9</div>
                  <div className="text-center hover:bg-slate-300 cursor-pointer ">f2</div>
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-center gap-10 mt-4 mb-4">
              {game ? (
                <>
                  <div>
                    <Button variant={'outline'}>Offer Draw</Button>
                  </div>
                  <div>
                    <Button variant={'outline'}>Surrender</Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Button variant={'outline'}>Offer Rematch</Button>
                  </div>
                  <div>
                    <Button variant={'outline'}>Find new game</Button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="grid w-full">
            <div className="text-center">
              <div className="text-center mb-2">
                <span className="font-bold">{playerStats[1]?.elo}</span> elo
              </div>
              <hr className="mb-2" />
              <h1 className="px-4 text-l text-ellipsis">
                <span className="font-bold">GM </span>
                {playerStats[1]?.name}
              </h1>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
