// @ts-nocheck

import { createContext, useContext, useState } from 'react'

const GlobalContext = createContext()

export const GlobalProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState({
    successRegisterMessage: '',
    unauthorizedRedirectMessage: '',
  })

  return (
    <GlobalContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => {
  return useContext(GlobalContext)
}
