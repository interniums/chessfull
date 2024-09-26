// @ts-nocheck

import { ArrowLeftIcon, ArrowRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { Button } from './ui/button'
import useAuth from '@/hooks/useAuth'
import { useEffect, useRef, useState } from 'react'

export default function GameInfoMain({
  offerDraw,
  handleAcceptDraw,
  handleRefuseDraw,
  handleOfferDraw,
  over,
  handleResign,
  history,
  waitDrawAnswer,
}) {
  const { auth } = useAuth()
  const [pairs, setPairs] = useState([])
  const scrollBottom = useRef(null)

  const updatePairs = (history) => {
    const newPairs = history.reduce((result, item, index, array) => {
      if (index % 2 === 0) {
        result.push(array.slice(index, index + 2))
      }
      return result
    }, [])

    setPairs(newPairs)
  }

  useEffect(() => {
    if (scrollBottom.current) {
      scrollBottom.current.scrollTop = scrollBottom.current.scrollHeight
    }
  }, [pairs])

  useEffect(() => {
    if (history && history.length > 0) {
      updatePairs(history)
    }
  }, [history])

  return (
    <div className="w-full px-6 max-h-full h-full min-h-80">
      {offerDraw ? (
        <>
          <div className="w-full min-h-80 flex items-center justify-center animate-pulse mt-10">
            <div className="w-full h-full">
              <h1 className="text-center">Your opponent is offering a draw</h1>
              <div className="flex items-center justify-center gap-8 mt-6">
                <Button className="w-full" variant={'outline'} onClick={() => handleAcceptDraw()}>
                  Accept
                </Button>
                <Button
                  variant={'outline'}
                  className="w-full"
                  onClick={() => {
                    handleRefuseDraw()
                  }}
                >
                  Refuse
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="min-h-80">
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
          <div ref={scrollBottom} className="flex py-4 w-full max-h-64 overflow-y-auto items-start min-h-64 mt-6">
            <div className="border-r w-min pr-2">
              {pairs.map((item, index) => (
                <div key={index} className="text-center hover:bg-slate-300 cursor-pointer">
                  {index}
                </div>
              ))}
            </div>
            <div className="flex w-full px-2 justify-center items-center">
              <div className="w-full">
                {pairs.map((item, index) => (
                  <div key={index} className="text-center hover:bg-slate-300 cursor-pointer">
                    {item?.length ? item[0] : ' - '}
                  </div>
                ))}
              </div>
              <div className="w-full">
                {pairs.map((item, index) => (
                  <div key={index} className="text-center hover:bg-slate-300 cursor-pointer">
                    {item?.length ? item[1] : ' - '}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-8 mt-10 mb-4 items-center justify-center">
            <div className={waitDrawAnswer ? 'animate-pulse' : ''}>
              <Button
                disabled={waitDrawAnswer || over.length ? true : false}
                variant={'outline'}
                onClick={() => handleOfferDraw()}
              >
                {waitDrawAnswer ? 'Draw offered' : 'Offer Draw '}
              </Button>
            </div>
            <div>
              <Button disabled={over.length ? true : false} variant={'outline'} onClick={() => handleResign()}>
                Resign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
