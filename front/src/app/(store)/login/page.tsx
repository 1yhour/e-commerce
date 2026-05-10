'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login({ email, password })
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.response?.data?.error || 'Invalid email or password.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left — editorial image panel ─────────────────────────── */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Brand mark */}
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/">
            <span
              className="text-2xl tracking-[0.35em] uppercase text-white font-normal"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              LUXE
            </span>
          </Link>
          <div>
            <p
              className="text-[10px] tracking-[0.3em] uppercase text-white/60 mb-3"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              The Edit — SS 2026
            </p>
            <p
              className="text-3xl text-white font-normal leading-snug max-w-xs"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Wear what<br />moves you.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right — form panel ────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 md:px-16 py-20 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <Link href="/" className="block lg:hidden mb-10">
            <span
              className="text-2xl tracking-[0.35em] uppercase text-black font-normal"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              LUXE
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-10">
            <p
              className="text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-3"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Welcome back
            </p>
            <h1
              className="text-4xl font-normal text-black"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Sign In
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-6 text-[11px] tracking-wide text-rose-500 border-l-2 border-rose-400 pl-3"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                className="peer w-full border-0 border-b border-stone-200 focus:border-black outline-none bg-transparent pt-5 pb-2 text-sm text-black placeholder-transparent transition-colors duration-300"
                style={{ fontFamily: 'var(--font-sans)' }}
              />
              <label
                htmlFor="email"
                className="absolute top-5 left-0 text-stone-400 text-xs tracking-[0.15em] uppercase transition-all duration-300 peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs peer-focus:top-0 peer-focus:text-[10px] peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[10px]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Email
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
                className="peer w-full border-0 border-b border-stone-200 focus:border-black outline-none bg-transparent pt-5 pb-2 text-sm text-black placeholder-transparent transition-colors duration-300 pr-8"
                style={{ fontFamily: 'var(--font-sans)' }}
              />
              <label
                htmlFor="password"
                className="absolute top-5 left-0 text-stone-400 text-xs tracking-[0.15em] uppercase transition-all duration-300 peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs peer-focus:top-0 peer-focus:text-[10px] peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[10px]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2.5 text-stone-400 hover:text-black transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
              </button>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={rememberMe}
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 border flex items-center justify-center transition-colors duration-200 ${rememberMe ? 'bg-black border-black' : 'border-stone-300'}`}
              >
                {rememberMe && <span className="text-white text-[10px] leading-none">✓</span>}
              </button>
              <span
                className="text-[11px] tracking-[0.1em] uppercase text-stone-400 cursor-pointer"
                style={{ fontFamily: 'var(--font-sans)' }}
                onClick={() => setRememberMe(!rememberMe)}
              >
                Remember me
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-black text-white text-[11px] tracking-[0.25em] uppercase hover:bg-stone-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Footer link */}
          <p
            className="mt-8 text-center text-[11px] tracking-[0.1em] text-stone-400"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            New to LUXE?{' '}
            <Link href="/register" className="text-black hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
