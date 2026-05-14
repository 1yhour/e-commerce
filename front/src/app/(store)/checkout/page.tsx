'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  ChevronRight,
  AlertCircle,
  Package,
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { checkoutApi, type Address, type KhqrData } from '@/lib/api/cart'
import KhqrPayment from '@/components/checkout/KhqrPayment'

// ── Mirrors CheckoutController calculation exactly ────────────────────────────
const TAX_RATE      = 0.10
const SHIPPING_FLAT = 3.00
const FREE_SHIPPING = 50.00

function calcTotals(subtotal: number) {
  const tax      = Math.round(subtotal * TAX_RATE * 100) / 100
  const shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FLAT
  const total    = Math.round((subtotal + tax + shipping) * 100) / 100
  return { tax, shipping, total }
}

// ── Phase type ────────────────────────────────────────────────────────────────
// form     → user picking address, reviewing items, filling note
// placing  → POST /checkout in-flight
// payment  → KHQR QR visible, polling running
// success  → payment confirmed, order processing

type Phase = 'form' | 'placing' | 'payment' | 'success'

// ── Loading skeleton ──────────────────────────────────────────────────────────

function AddressSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="h-20 bg-[#F0ECE8] rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

// ── Address selector card ─────────────────────────────────────────────────────

function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address: Address
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
        selected
          ? 'border-[#1A1A1A] bg-white shadow-sm'
          : 'border-[#E8E4DF] bg-white hover:border-[#C0B9B0]',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        {/* Radio dot */}
        <span
          className={[
            'mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
            selected ? 'border-[#1A1A1A]' : 'border-[#C0B9B0]',
          ].join(' ')}
        >
          {selected && (
            <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
          )}
        </span>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">
            {address.label}
          </p>
          <p className="text-xs text-[#6B6560] mt-0.5 leading-relaxed">
            {address.full_address}
          </p>
        </div>
      </div>
    </button>
  )
}

// ── Address Form ──────────────────────────────────────────────────────────────

function AddressForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (newAddress: Address) => void
  onCancel?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    label: '',
    street: '',
    city: '',
    is_default: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await checkoutApi.createAddress(formData)
      onSuccess(data)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save address.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-[#E8E4DF] slide-up">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#9A9490] mb-1.5 ml-1">
            Label (e.g. Home, Work)
          </label>
          <input
            required
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="Home"
            className="w-full text-sm bg-[#F9F7F5] border border-[#E8E4DF] rounded-xl px-4 py-3 outline-none focus:border-[#1A1A1A] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#9A9490] mb-1.5 ml-1">
            Street Address
          </label>
          <input
            required
            type="text"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            placeholder="123 Street Name"
            className="w-full text-sm bg-[#F9F7F5] border border-[#E8E4DF] rounded-xl px-4 py-3 outline-none focus:border-[#1A1A1A] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#9A9490] mb-1.5 ml-1">
            City
          </label>
          <input
            required
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Phnom Penh"
            className="w-full text-sm bg-[#F9F7F5] border border-[#E8E4DF] rounded-xl px-4 py-3 outline-none focus:border-[#1A1A1A] transition-colors"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2 ml-1 flex items-center gap-1.5">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#1A1A1A] text-white py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#333] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Saving...' : 'Save Address'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-xs font-medium text-[#6B6560] hover:text-[#1A1A1A] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

// ── Order summary sidebar ─────────────────────────────────────────────────────
// Always visible; shows cart items + price breakdown
// After order placement, `confirmedTotal` (from backend) overrides the estimate

function OrderSummary({
  subtotal,
  confirmedTotal,
}: {
  subtotal: number
  confirmedTotal?: number // from CheckoutResponse.data.total — authoritative
}) {
  const { cart } = useCartStore()
  const { tax, shipping, total } = calcTotals(subtotal)

  // If backend has confirmed the total, use that; otherwise show estimate
  const displayTotal = confirmedTotal ?? total

  return (
    <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-widest">
        Order Summary
      </h2>

      {/* Cart items (compact) */}
      <ul className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {cart.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#F5F3F0] shrink-0 overflow-hidden relative">
              {item.product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={14} className="text-[#C0B9B0]" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#1A1A1A] truncate">
                {item.product.name}
              </p>
              <p className="text-[11px] text-[#9A9490]">Qty {item.quantity}</p>
            </div>
            <span className="text-xs font-semibold text-[#1A1A1A] shrink-0">
              ${item.line_total.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-[#F0ECE8]" />

      {/* Price breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-[#6B6560]">
          <span>Subtotal</span>
          <span className="font-medium text-[#1A1A1A]">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[#6B6560]">
          <span>Tax (10%)</span>
          <span className="font-medium text-[#1A1A1A]">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[#6B6560]">
          <span>Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? (
              <span className="text-emerald-600 font-semibold">Free</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>
      </div>

      <div className="border-t border-[#F0ECE8] pt-3 flex justify-between items-center">
        <span className="text-sm font-bold text-[#1A1A1A]">Total</span>
        <span className="text-xl font-bold text-[#1A1A1A]">
          ${displayTotal.toFixed(2)}
          {confirmedTotal && (
            <span className="text-xs font-normal text-[#9A9490] ml-1">USD</span>
          )}
        </span>
      </div>
    </div>
  )
}

// ── Success state (inline, replaces form once payment confirmed) ──────────────

function SuccessState({ orderId }: { orderId: string }) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center text-center py-10 px-4">
      <style>{`
        @keyframes success-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.08); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .success-pop { animation: success-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      <div className="success-pop w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6">
        <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={1.5} />
      </div>

      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Order Confirmed!</h2>
      <p className="text-sm text-[#6B6560] mb-1">Payment received successfully.</p>

      <div className="flex items-center gap-2 mt-4 mb-8 px-4 py-2.5 bg-[#F5F3F0] rounded-full border border-[#E8E4DF]">
        <Package size={14} className="text-[#9A9490]" />
        <span className="text-xs text-[#6B6560]">Order ID:</span>
        <span className="text-xs font-bold text-[#1A1A1A] font-mono">{orderId}</span>
      </div>

      <p className="text-xs text-[#9A9490] mb-8 max-w-xs leading-relaxed">
        Your order is now being processed. You'll receive a confirmation shortly.
      </p>

      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1A1A1A] text-white text-sm font-medium
                   hover:bg-[#333] active:scale-95 transition-all"
      >
        Continue Shopping
      </button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, hasFetched, fetchCart, clearCart } = useCartStore()

  // ── Form state ─────────────────────────────────────────────────────────────
  const [addresses, setAddresses]         = useState<Address[]>([])
  const [addressLoading, setAddrLoading]  = useState(true)
  const [addressError, setAddrError]      = useState(false)
  const [selectedAddressId, setSelectedId] = useState<string>('')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [note, setNote]                   = useState('')

  // ── Phase + result state ───────────────────────────────────────────────────
  const [phase, setPhase]               = useState<Phase>('form')
  const [placeError, setPlaceError]     = useState<string | null>(null)
  const [khqrData, setKhqrData]         = useState<KhqrData | null>(null)
  const [orderId, setOrderId]           = useState<string>('')
  const [confirmedTotal, setConfirmedTotal] = useState<number | undefined>()

  // ── Boot: fetch cart + addresses ───────────────────────────────────────────
  useEffect(() => {
    if (!hasFetched) fetchCart()
  }, [hasFetched, fetchCart])

  useEffect(() => {
    // Redirect to cart if empty (once cart is loaded)
    if (hasFetched && cart.items.length === 0 && phase === 'form') {
      router.replace('/cart')
    }
  }, [hasFetched, cart.items.length, phase, router])

  useEffect(() => {
    // Guard: must be authenticated
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
      router.replace('/login')
    }
  }, [router])

  useEffect(() => {
    let cancelled = false
    setAddrLoading(true)
    setAddrError(false)

    checkoutApi.getAddresses()
      .then((data) => {
        if (cancelled) return
        setAddresses(data)
        // Auto-select first address
        if (data.length > 0) setSelectedId(data[0].id)
      })
      .catch(() => {
        if (!cancelled) setAddrError(true)
      })
      .finally(() => {
        if (!cancelled) setAddrLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  // ── Place order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setPlaceError('Please select a delivery address.')
      return
    }

    setPhase('placing')
    setPlaceError(null)

    try {
      // POST /api/checkout
      // Payload matches CheckoutController validation exactly:
      //   address_id, note?, payment_method
      const res = await checkoutApi.placeOrder({
        address_id:     selectedAddressId,
        note:           note.trim() || undefined,
        payment_method: 'khqr',
      })

      // res.data: { order_id, total, payment: {id,method,status}, khqr: KhqrData }
      setOrderId(res.data.order_id)
      setConfirmedTotal(res.data.total)   // authoritative total from backend
      setKhqrData(res.data.khqr)          // qr_string, md5, amount, currency, expires_at
      setPhase('payment')
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? 'Failed to place order. Please try again.'
      setPlaceError(message)
      setPhase('form')
    }
  }

  // ── Payment confirmed callback (from KhqrPayment) ─────────────────────────
  const handlePaymentSuccess = (confirmedOrderId: string) => {
    clearCart() // wipe local cart — backend already cleared it
    setPhase('success')
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const subtotal = cart.subtotal // from Cart.subtotal (server-computed)
  const canPlaceOrder = selectedAddressId && phase === 'form'

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slide-up 0.4s ease both; }
        .slide-up-delay { animation: slide-up 0.4s ease 0.15s both; }
      `}</style>

      <div className="min-h-screen bg-[#FAFAF8]">

        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <div className="border-b border-[#E8E4DF] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            {phase === 'form' || phase === 'placing' ? (
              <Link
                href="/cart"
                className="flex items-center gap-1.5 text-sm text-[#6B6560] hover:text-[#1A1A1A] transition-colors"
              >
                <ArrowLeft size={15} />
                Back to Cart
              </Link>
            ) : (
              <div />
            )}
            <h1 className="text-base font-semibold text-[#1A1A1A] tracking-wide">
              {phase === 'success' ? 'Order Confirmed' : 'Checkout'}
            </h1>
            <div className="w-28" />
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">

          {/* ── Success phase: full-width ─────────────────────────────── */}
          {phase === 'success' ? (
            <SuccessState orderId={orderId} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">

              {/* ── Left column ─────────────────────────────────────── */}
              <div className="md:col-span-7 space-y-8 slide-up">

                {/* ── Payment phase: order placed indicator ───────── */}
                {(phase === 'payment') && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Order placed!</p>
                      <p className="text-xs text-emerald-600 font-mono">{orderId}</p>
                    </div>
                  </div>
                )}

                {/* ── Address section ──────────────────────────────── */}
                {phase !== 'payment' && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={16} className="text-[#C9A96E]" />
                      <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-widest">
                        Delivery Address
                      </h2>
                    </div>

                    {addressLoading ? (
                      <AddressSkeleton />
                    ) : addressError ? (
                      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                        <AlertCircle size={15} />
                        Failed to load addresses.{' '}
                        <button
                          className="underline"
                          onClick={() => {
                            setAddrLoading(true)
                            setAddrError(false)
                            checkoutApi.getAddresses()
                              .then((data) => {
                                setAddresses(data)
                                if (data.length > 0) setSelectedId(data[0].id)
                              })
                              .catch(() => setAddrError(true))
                              .finally(() => setAddrLoading(false))
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    ) : (showAddressForm || addresses.length === 0) ? (
                      <AddressForm
                        onSuccess={(newAddr) => {
                          setAddresses((prev) => [newAddr, ...prev])
                          setSelectedId(newAddr.id)
                          setShowAddressForm(false)
                        }}
                        onCancel={addresses.length > 0 ? () => setShowAddressForm(false) : undefined}
                      />
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((addr) => (
                          <AddressCard
                            key={addr.id}
                            address={addr}
                            selected={selectedAddressId === addr.id}
                            onSelect={() => setSelectedId(addr.id)}
                          />
                        ))}
                        
                      </div>
                    )}
                  </section>
                )}

                {/* ── Note section ─────────────────────────────────── */}
                {phase !== 'payment' && (
                  <section>
                    <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-widest mb-3">
                      Order Note
                      <span className="ml-2 text-[10px] font-normal text-[#9A9490] normal-case">
                        Optional
                      </span>
                    </h2>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Special instructions, gift message…"
                      className="w-full text-sm text-[#1A1A1A] placeholder:text-[#C0B9B0]
                                 bg-white border border-[#E8E4DF] rounded-xl px-4 py-3
                                 resize-none focus:outline-none focus:border-[#1A1A1A]
                                 transition-colors"
                    />
                    <p className="text-right text-[10px] text-[#C0B9B0] mt-1">
                      {note.length}/500
                    </p>
                  </section>
                )}

                {/* ── Payment phase: KHQR QR on left for mobile ────── */}
                {phase === 'payment' && khqrData && (
                  <div className="md:hidden">
                    <KhqrPayment
                      orderId={orderId}
                      initialKhqr={khqrData}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  </div>
                )}
              </div>

              {/* ── Right column ────────────────────────────────────── */}
              <div className="md:col-span-5 space-y-5 slide-up-delay">

                {/* Order summary — always visible */}
                <OrderSummary
                  subtotal={subtotal}
                  confirmedTotal={confirmedTotal}
                />

                {/* Place order button — form phase only */}
                {(phase === 'form' || phase === 'placing') && (
                  <div className="space-y-3">
                    {placeError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                        <AlertCircle size={13} className="shrink-0 mt-0.5" />
                        {placeError}
                      </div>
                    )}

                    <button
                      onClick={handlePlaceOrder}
                      disabled={!canPlaceOrder}
                      className="w-full flex items-center justify-center gap-2.5 py-4 rounded-full
                                 bg-[#1A1A1A] text-white text-sm font-semibold tracking-wide
                                 hover:bg-[#333] active:scale-[0.98] transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {phase === 'placing' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Placing Order…
                        </>
                      ) : (
                        <>
                          Place Order & Pay with KHQR
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>

                    <p className="text-center text-[10px] text-[#B0AAA4] uppercase tracking-wider">
                      Secure checkout · NBC Bakong
                    </p>
                  </div>
                )}

                {/* KhqrPayment — payment phase, right column on desktop */}
                {phase === 'payment' && khqrData && (
                  <div className="hidden md:block bg-white border border-[#E8E4DF] rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-widest mb-5">
                      Scan to Pay
                    </h3>
                    <KhqrPayment
                      orderId={orderId}
                      initialKhqr={khqrData}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}