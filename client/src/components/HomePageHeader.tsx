// @ts-nocheck

import { Link, useLocation, useNavigate } from 'react-router-dom'
import rook from '../assets/images/rook.svg'
import useAuth from '@/hooks/useAuth'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import hamburger from '../assets/images/hamburger-menu-svgrepo-com.svg'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { useGlobalContext } from '@/context/GlobalContext'
import { useState } from 'react'

export default function HomePageHeader() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { globalState, setGlobalState } = useGlobalContext()
  const [sheet, setSheet] = useState(false)
  const isDynamicGameRoute =
    /^\/socket\/game\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

  return (
    <header
      className={
        isDynamicGameRoute.test(location.hash) ? 'w-full sticky top-0 flex z-50' : 'w-full absolute top-0 flex z-50'
      }
    >
      <section className="flex py-2 px-4 w-full justify-center lg:justify-between md:justify-between transition-all">
        <Link className="flex items-center justify-center w-max" to={'/socket/home'}>
          <h1 className="text-4xl font-bold cursor-pointer">Chessfull</h1>
          <img src={rook} alt="rook" className="size-10 mb-2" />
        </Link>
        {isDynamicGameRoute.test(location.pathname) ||
        location.pathname == '/wellcome' ||
        location.pathname == '/registration' ||
        location.pathname == '/login' ? null : (
          <Sheet open={sheet} onOpenChange={() => setSheet(!sheet)}>
            <SheetTrigger asChild>
              <button className="border-none outline-none cursor-pointer hover:bg-slate-100 py-2 px-2 rounded-xl relative">
                <img src={hamburger} alt="hamburger menu button" title="menu" className="size-10" />
                {globalState?.newMessage ? (
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse absolute top-0 right-0"></div>
                ) : null}
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="text-3xl">Menu</SheetTitle>
                <SheetDescription className="font-medium text-md">navigation menu</SheetDescription>
                <hr />
              </SheetHeader>
              <div className="grid py-6 h-full">
                <Accordion type="single" collapsible>
                  <AccordionItem value="play">
                    <AccordionTrigger className="font-bold text-2xl">Play chess</AccordionTrigger>
                    <AccordionContent>
                      <div
                        onClick={() =>
                          navigate(`/socket/game/queue/blitz`, { state: { gameMode: 'blitz', id: auth.id } })
                        }
                        className="text-lg py-1 px-2 cursor-pointer rounded hover:bg-slate-200"
                      >
                        Play with random opponent
                      </div>
                      <div
                        onClick={() => {
                          navigate(`/socket/home`, { state: { showCreateGameDialogFromState: true } })
                          window.location.reload()
                        }}
                        className="text-lg py-1 px-2 cursor-pointer rounded hover:bg-slate-200"
                      >
                        Play with friends
                      </div>
                      <Button
                        disabled
                        variant={'ghost'}
                        className="text-lg py-1 px-2 cursor-pointer rounded hover:bg-slate-200"
                      >
                        Play vs computer
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="profile">
                    <AccordionTrigger
                      className={
                        globalState?.newMessage
                          ? 'font-bold text-2xl relative animate-pulse bg-red-50'
                          : 'font-bold text-2xl relative'
                      }
                    >
                      Profile & chat
                    </AccordionTrigger>
                    <AccordionContent>
                      <Button
                        onClick={() => {
                          navigate(`/socket/profile/${auth.id}`)
                          window.location.reload()
                        }}
                        className="text-lg py-1 px-2 cursor-pointer rounded hover:bg-slate-200 border-none w-full justify-start"
                        variant={'ghost'}
                      >
                        Open profile
                      </Button>
                      <div
                        onClick={() => {
                          setSheet(false)
                          setGlobalState((prev) => ({ ...prev, friendsOpen: true }))
                        }}
                        className="text-lg py-1 px-2 cursor-pointer rounded hover:bg-slate-200"
                      >
                        Open friends & search
                      </div>
                      <div
                        onClick={() => {
                          navigate('/socket/messages')
                          window.location.reload()
                        }}
                        className={
                          globalState?.newMessage
                            ? 'text-lg py-1 px-2 cursor-pointer rounded hover:bg-slate-200 relative animate-pulse bg-red-50'
                            : 'text-lg py-1 px-2 cursor-pointer rounded hover:bg-slate-200 relative'
                        }
                      >
                        Open chat
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="settings">
                    <AccordionTrigger className="font-bold text-2xl">Settings</AccordionTrigger>
                    <AccordionContent>
                      <div
                        onClick={() => {
                          navigate(`/socket/profile/${auth.id}`, {
                            state: { showSettingsOpenFromState: true, activeTabFromState: 'account' },
                          })
                          window.location.reload()
                        }}
                        className="text-lg py-1 px-2 cursor-pointer rounded hover:bg-slate-200"
                      >
                        Open account settings
                      </div>
                      <div
                        onClick={() => {
                          navigate(`/socket/profile/${auth.id}`, {
                            state: { activeTabFromState: 'game', showSettingsOpenFromState: true },
                          })
                          window.location.reload()
                        }}
                        className="text-lg py-1 px-2 cursor-pointer rounded hover:bg-slate-200"
                      >
                        Open game settings
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="grid items-end mb-10">
                  <h1 className="text-2xl text-center hover:underline cursor-pointer">Contact us</h1>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </section>
    </header>
  )
}
