'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Order, User } from './types'

export type StoreState = {
  isAuthenticated: boolean
  user: User | null
  orders: Order[]
}

export type StoreContextType = {
  state: StoreState
  login: (user: User) => void
  logout: () => void
  cartItemCount: number
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>({
    isAuthenticated: false,
    user: null,
    orders: [],
  })

  // Mock cart item count for now
  const [cartItemCount, setCartItemCount] = useState(0)

  const login = (user: User) => {
    setState((prevState) => ({
      ...prevState,
      isAuthenticated: true,
      user,
    }))
  }

  const logout = () => {
    setState((prevState) => ({
      ...prevState,
      isAuthenticated: false,
      user: null,
    }))
  }

  return (
    <StoreContext.Provider value={{ state, login, logout, cartItemCount }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
