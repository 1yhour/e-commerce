'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const passwordRequirements = [
  { label: 'At least 8 characters',    test: (p: string) => p.length >= 8 },
  { label: 'Contains a number',         test: (p: string) => /\d/.test(p) },
  { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
]

export default function RegisterPage() {
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'Required'
    if (!formData.lastName.trim())  newErrors.lastName  = 'Required'
    if (!formData.email.trim())     newErrors.email     = 'Required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email'
    if (!formData.password)         newErrors.password  = 'Required'
    else if (formData.password.length < 8) newErrors.password = 'Minimum 8 characters'
    if (!acceptTerms)               newErrors.terms     = 'Please accept the terms'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setErrors({})
    try {
      await register({
        first_name: formData.firstName,
        last_name:  formData.lastName,
        email:      formData.email,
        password:   formData.password,
        phone:      formData.phoneNumber,
      })
    } catch (err: any) {
      const errorData = err.response?.data
      if (errorData?.errors) {
        const newErrors: Record<string, string> = {}
        if (errorData.errors.email)      newErrors.email     = errorData.errors.email[0]
        if (errorData.errors.password)   newErrors.password  = errorData.errors.password[0]
        if (errorData.errors.first_name) newErrors.firstName = errorData.errors.first_name[0]
        if (errorData.errors.last_name)  newErrors.lastName  = errorData.errors.last_name[0]
        setErrors(newErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left — editorial image panel ──────────────────────────── */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
        <div className="absolute inset-0 bg-black/25" />

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
              New Member
            </p>
            <p
              className="text-3xl text-white font-normal leading-snug max-w-xs"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Style is a way<br />to say who you are.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right — form panel ─────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 md:px-16 py-16 bg-white overflow-y-auto">
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
              Join us
            </p>
            <h1
              className="text-4xl font-normal text-black"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Create Account
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First + Last name row */}
            <div className="grid grid-cols-2 gap-4">
              {/* First name */}
              <div className="relative">
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full border-0 border-b border-stone-200 focus:border-black outline-none bg-transparent pt-5 pb-2 text-sm text-black placeholder-transparent transition-colors duration-300"
                  style={{ fontFamily: 'var(--font-sans)' }}
                />
                <label
                  htmlFor="firstName"
                  className="absolute top-5 left-0 text-stone-400 text-xs tracking-[0.15em] uppercase transition-all duration-300 peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs peer-focus:top-0 peer-focus:text-[10px] peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[10px]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  First
                </label>
                {errors.firstName && (
                  <p className="text-[10px] text-rose-400 mt-1" style={{ fontFamily: 'var(--font-sans)' }}>
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last name */}
              <div className="relative">
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full border-0 border-b border-stone-200 focus:border-black outline-none bg-transparent pt-5 pb-2 text-sm text-black placeholder-transparent transition-colors duration-300"
                  style={{ fontFamily: 'var(--font-sans)' }}
                />
                <label
                  htmlFor="lastName"
                  className="absolute top-5 left-0 text-stone-400 text-xs tracking-[0.15em] uppercase transition-all duration-300 peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs peer-focus:top-0 peer-focus:text-[10px] peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[10px]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Last
                </label>
                {errors.lastName && (
                  <p className="text-[10px] text-rose-400 mt-1" style={{ fontFamily: 'var(--font-sans)' }}>
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
              {errors.email && (
                <p className="text-[10px] text-rose-400 mt-1" style={{ fontFamily: 'var(--font-sans)' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
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
              {errors.password && (
                <p className="text-[10px] text-rose-400 mt-1" style={{ fontFamily: 'var(--font-sans)' }}>
                  {errors.password}
                </p>
              )}

              {/* Password requirements */}
              {formData.password.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check
                        className={`w-3 h-3 transition-colors ${req.test(formData.password) ? 'text-black' : 'text-stone-300'}`}
                        strokeWidth={2.5}
                      />
                      <span
                        className={`text-[10px] tracking-wide transition-colors ${req.test(formData.password) ? 'text-black' : 'text-stone-300'}`}
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Phone (optional) */}
            <div className="relative">
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder=" "
                className="peer w-full border-0 border-b border-stone-200 focus:border-black outline-none bg-transparent pt-5 pb-2 text-sm text-black placeholder-transparent transition-colors duration-300"
                style={{ fontFamily: 'var(--font-sans)' }}
              />
              <label
                htmlFor="phoneNumber"
                className="absolute top-5 left-0 text-stone-400 text-xs tracking-[0.15em] uppercase transition-all duration-300 peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs peer-focus:top-0 peer-focus:text-[10px] peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[10px]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Phone{' '}
                <span className="normal-case text-stone-300">(optional)</span>
              </label>
            </div>

            {/* Accept terms */}
            <div className="flex items-start gap-3 pt-1">
              <button
                type="button"
                role="checkbox"
                aria-checked={acceptTerms}
                onClick={() => setAcceptTerms(!acceptTerms)}
                className={`mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${acceptTerms ? 'bg-black border-black' : 'border-stone-300'}`}
              >
                {acceptTerms && <span className="text-white text-[10px] leading-none">✓</span>}
              </button>
              <span
                className="text-[11px] tracking-wide text-stone-400 leading-relaxed"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                I agree to the{' '}
                <Link href="#" className="text-black underline underline-offset-2">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-black underline underline-offset-2">Privacy Policy</Link>
              </span>
            </div>
            {errors.terms && (
              <p className="text-[10px] text-rose-400" style={{ fontFamily: 'var(--font-sans)' }}>
                {errors.terms}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-black text-white text-[11px] tracking-[0.25em] uppercase hover:bg-stone-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          {/* Footer link */}
          <p
            className="mt-8 text-center text-[11px] tracking-[0.1em] text-stone-400"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Already have an account?{' '}
            <Link href="/login" className="text-black hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
