'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import CartItemRow from '@/components/cart/CartItemRow'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function CartPage() {
  const { cart, isLoading, fetchCart, hasFetched } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  if (isLoading && !hasFetched) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24">
        <h1 className="text-3xl font-serif mb-8 text-[#1A1A1A]">Shopping Bag</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 py-4 border-b border-[#E8E4DF]">
                <Skeleton className="h-24 w-24 rounded bg-[#F5F3F0]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3 bg-[#F5F3F0]" />
                  <Skeleton className="h-4 w-1/4 bg-[#F5F3F0]" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-64 w-full rounded bg-[#F5F3F0]" />
          </div>
        </div>
      </div>
    )
  }

  if (hasFetched && cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-[#F5F3F0] rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="text-[#9A9490]" size={32} />
        </div>
        <h1 className="text-3xl font-serif mb-4 text-[#1A1A1A]">Your bag is empty</h1>
        <p className="text-[#6B6661] mb-10 max-w-md">
          It looks like you haven't added anything to your bag yet. 
          Explore our latest collections to find something you love.
        </p>
        <Button asChild className="rounded-full px-8 py-6 h-auto text-base">
          <Link href="/newarrival">Start Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="flex items-baseline justify-between mb-10 border-b border-[#E8E4DF] pb-6">
        <h1 className="text-3xl md:text-4xl font-serif text-[#1A1A1A]">Shopping Bag</h1>
        <span className="text-[#9A9490] font-medium">
          {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Cart Items List */}
        <div className="lg:col-span-8">
          <div className="divide-y divide-[#E8E4DF]">
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-[#FBF9F7] rounded-2xl p-8 sticky top-24">
            <h2 className="text-xl font-serif mb-6 text-[#1A1A1A]">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[#6B6661]">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B6661]">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="pt-4 border-t border-[#E8E4DF] flex justify-between font-semibold text-lg text-[#1A1A1A]">
                <span>Total</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
            </div>

            <Button asChild className="w-full rounded-full py-6 h-auto text-base group">
              <Link href="/checkout">
                Checkout 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <div className="mt-8 space-y-4">
              <p className="text-xs text-[#9A9490] leading-relaxed text-center">
                Shipping and taxes calculated at checkout. <br />
                All transactions are secure and encrypted.
              </p>
              
              <div className="flex justify-center items-center gap-4 grayscale opacity-50">
                 {/* Icons or text for payment methods */}
                 <span className="text-[10px] font-bold border border-stone-300 px-1 rounded">KHQR</span>
                 <span className="text-[10px] font-bold border border-stone-300 px-1 rounded">VISA</span>
                 <span className="text-[10px] font-bold border border-stone-300 px-1 rounded">MASTERCARD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}