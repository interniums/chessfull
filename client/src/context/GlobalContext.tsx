// @ts-nocheck

import useAuth from '@/hooks/useAuth'
import getSocket from '@/socket'
import { createContext, useContext, useState } from 'react'

const GlobalContext = createContext()

export const GlobalProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState({
    successRegisterMessage: '',
    unauthorizedRedirectMessage: '',
    friendsOpen: false,
    gameInvite: {
      from: '',
      name: '',
      gamemode: '',
      expired: false,
    },
  })

  return <GlobalContext.Provider value={{ globalState, setGlobalState }}>{children}</GlobalContext.Provider>
}

export const useGlobalContext = () => {
  return useContext(GlobalContext)
}
