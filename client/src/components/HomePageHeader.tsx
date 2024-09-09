// @ts-nocheck

import { Link } from 'react-router-dom'
import rook from '../assets/rook.svg'
import useAuth from '@/hooks/useAuth'

export default function HomePageHeader({ variant }) {
  const { auth } = useAuth()

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
          <h1>Active user: {auth?.username}</h1>
        </Link>
      </section>
    </header>
  )
}
