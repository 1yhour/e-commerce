'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ArrowLeft, Trash2, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import CartItemRow from '@/components/cart/CartItemRow'

// ── Tax / shipping mirrors CheckoutController logic ───────────────────────────
const TAX_RATE      = 0.10
const SHIPPING_FLAT = 3.00
const FREE_SHIPPING = 50.00

function calcTotals(subtotal: number) {
  const tax      = Math.round(subtotal * TAX_RATE * 100) / 100
  const shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FLAT
  const total    = Math.round((subtotal + tax + shipping) * 100) / 100
  return { tax, shipping, total }
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function CartSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-12 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="h-8 w-48 bg-[#E8E4DF] rounded animate-pulse mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-7 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-20 h-20 bg-[#E8E4DF] rounded animate-pulse shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-[#E8E4DF] rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-[#E8E4DF] rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
          <div className="md:col-span-5">
            <div className="h-64 bg-[#E8E4DF] rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div className="w-20 h-20 rounded-full bg-[#F0ECE8] flex items-center justify-center mb-6">
        <ShoppingBag size={32} className="text-[#C0B9B0]" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Your cart is empty</h2>
      <p className="text-sm text-[#9A9490] mb-8 max-w-xs">
        Add some items to get started
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1A1A1A] text-white text-sm font-medium
                   hover:bg-[#333] active:scale-95 transition-all"
      >
        <ArrowLeft size={15} />
        Continue Shopping
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const { cart, isLoading, hasFetched, fetchCart, clearCart } = useCartStore()
  const router = useRouter()

  useEffect(() => {
    if (!hasFetched) fetchCart()
  }, [hasFetched, fetchCart])

  if (isLoading && !hasFetched) return <CartSkeleton />

  const { tax, shipping, total } = calcTotals(cart.subtotal)
  const isEmpty = cart.items.length === 0

  return (
    <>
      <style>{`
        @keyframes page-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .page-in { animation: page-in 0.35s ease both; }
      `}</style>

      <div className="min-h-screen bg-[#FAFAF8]">
        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="border-b border-[#E8E4DF] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-[#6B6560] hover:text-[#1A1A1A] transition-colors"
            >
              <ArrowLeft size={15} />
              Continue Shopping
            </Link>
            <h1 className="text-base font-semibold text-[#1A1A1A] tracking-wide">
              Shopping Cart
              {cart.total_items > 0 && (
                <span className="ml-2 text-xs font-normal text-[#9A9490]">
                  ({cart.total_items} {cart.total_items === 1 ? 'item' : 'items'})
                </span>
              )}
            </h1>
            <div className="w-28" /> {/* spacer to center heading */}
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
          {isEmpty ? (
            <EmptyCart />
          ) : (
            <div className="page-in grid grid-cols-1 md:grid-cols-12 gap-10 items-start">

              {/* ── Left: item list ───────────────────────────────────────── */}
              <div className="md:col-span-7">
                <div className="divide-y divide-[#F0ECE8]">
                  {cart.items.map((item) => (
                    <CartItemRow key={item.id} item={item} compact={false} />
                  ))}
                </div>

                {/* Clear cart */}
                <button
                  onClick={() => clearCart()}
                  className="mt-6 flex items-center gap-1.5 text-xs text-[#9A9490] hover:text-red-400
                             transition-colors"
                >
                  <Trash2 size={13} />
                  Clear cart
                </button>
              </div>

              {/* ── Right: order summary ─────────────────────────────────── */}
              <div className="md:col-span-5">
                <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-4 sticky top-24">
                  <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-widest">
                    Order Summary
                  </h2>

                  {/* Line rows */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-[#6B6560]">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#1A1A1A]">${cart.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#6B6560]">
                      <span>Estimated Tax (10%)</span>
                      <span className="font-medium text-[#1A1A1A]">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#6B6560]">
                      <span>Shipping</span>
                      <span className="font-medium text-[#1A1A1A]">
                        {shipping === 0 ? (
                          <span className="text-emerald-600 font-semibold">Free</span>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[#F0ECE8] pt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-[#1A1A1A]">Total</span>
                    <span className="text-lg font-bold text-[#1A1A1A]">${total.toFixed(2)}</span>
                  </div>

                  {/* Free shipping progress */}
                  {cart.subtotal < FREE_SHIPPING && (
                    <div className="text-xs text-[#9A9490] bg-[#F5F3F0] rounded-xl p-3">
                      Add{' '}
                      <span className="font-semibold text-[#C9A96E]">
                        ${(FREE_SHIPPING - cart.subtotal).toFixed(2)}
                      </span>{' '}
                      more for free shipping
                      <div className="mt-2 h-1 rounded-full bg-[#E8E4DF] overflow-hidden">
                        <div
                          className="h-full bg-[#C9A96E] rounded-full transition-all duration-500"
                          style={{ width: `${(cart.subtotal / FREE_SHIPPING) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => router.push('/checkout')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full
                               bg-[#1A1A1A] text-white text-sm font-semibold tracking-wide
                               hover:bg-[#333] active:scale-[0.98] transition-all"
                  >
                    Proceed to Checkout
                    <ChevronRight size={16} />
                  </button>

                  <p className="text-center text-[10px] text-[#B0AAA4] uppercase tracking-wider">
                    Secure checkout · KHQR payment
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  )
}