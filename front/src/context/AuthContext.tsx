'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import api from '@/lib/axios'
interface Role {
  id: string
  name: string
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role?: Role
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (data: {
    first_name: string
    last_name: string
    email: string
    password: string
    phone?: string
  }) => Promise<void>
  logout: () => Promise<void>
  cartItemCount: number
}

//context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cartItemCount] = useState(0)
  const router = useRouter()


  /* ── Rehydrate session on mount ───────────────────────────────────────── */
// validate token by fetching the current user from backend
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')

    if (savedToken) {
      setToken(savedToken)
      // Validate token by fetching the current user from backend
      api
        .get('/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
        .then((res) => {
          setUser(res.data)
        })
        .catch(() => {
          // Token expired or invalid – clear everything
          localStorage.removeItem('auth_token')
          setToken(null)
          setUser(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  /* ── Login ────────────────────────────────────────────────────────────── */

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const response = await api.post('/auth/login', credentials)
      const { access_token, user: userData } = response.data

      setToken(access_token)
      setUser(userData)
      localStorage.setItem('auth_token', access_token)

      toast.success(`Welcome back, ${userData.first_name || 'User'}!`)

      if (userData.role?.name === 'Admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    },
    [router],
  )

  /* ── Register ─────────────────────────────────────────────────────────── */

  const register = useCallback(
    async (data: {
      first_name: string
      last_name: string
      email: string
      password: string
      phone?: string
    }) => {
      const response = await api.post('/auth/register', data)
      const { access_token, user: userData } = response.data

      setToken(access_token)
      setUser(userData)
      localStorage.setItem('auth_token', access_token)

      toast.success(`Welcome to LX Shop, ${userData.first_name}!`)
      router.push('/')
    },
    [router],
  )

  /* ── Logout ───────────────────────────────────────────────────────────── */

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Even if the API call fails, clear local state
    }
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
    toast.success('Logged out successfully')
    router.push('/login')
  }, [router])

  /* ── Provider ─────────────────────────────────────────────────────────── */

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        cartItemCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
