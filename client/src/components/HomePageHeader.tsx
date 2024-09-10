// @ts-nocheck

import { Link } from 'react-router-dom'
import rook from '../assets/rook.svg'
import useAuth from '@/hooks/useAuth'
import { Button } from './ui/button'
import useLogout from '@/hooks/useLogout'

export default function HomePageHeader({ variant }) {
  const { auth } = useAuth()
  const logout = useLogout()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="w-full py-2 px-4 absolute top-0 flex">
      <section className="w-full">
        <Link
          style={{ justifyContent: variant === 'play' ? 'start' : 'center' }}
          className="flex items-center justify-center w-max"
          to={'/home'}
        >
          <h1 className="text-4xl font-bold cursor-pointer">Chessfull</h1>
          <img src={rook} alt="rook" className="size-10 mb-2" />
        </Link>
      </section>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <h1 className="w-full">Active user: {auth?.username ? auth?.username : ' none'}</h1>
        <Button onClick={handleLogout} variant={'outline'}>
          Logout
        </Button>
      </div>
    </header>
  )
}
