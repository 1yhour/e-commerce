'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, CreditCard, ShieldCheck, Info } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/stores/cartStore'
import { checkoutApi, type Address, type CheckoutResponse } from '@/lib/api/cart'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import KhqrPayment from '@/components/checkout/KhqrPayment'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, isLoading: isCartLoading, fetchCart } = useCartStore()
  
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [isAddressesLoading, setIsAddressesLoading] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null)

  useEffect(() => {
    fetchCart()
    loadAddresses()
  }, [fetchCart])

  const loadAddresses = async () => {
    try {
      const data = await checkoutApi.getAddresses()
      setAddresses(data)
      if (data.length > 0) {
        setSelectedAddressId(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load addresses:', error)
      toast.error('Could not load shipping addresses')
    } finally {
      setIsAddressesLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address')
      return
    }

    setIsPlacingOrder(true)
    try {
      const response = await checkoutApi.placeOrder({
        address_id: selectedAddressId,
        payment_method: 'khqr',
      })
      setCheckoutData(response)
      toast.success('Order placed successfully!')
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to place order'
      toast.error(msg)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // If order is placed, show QR Payment
  if (checkoutData) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="max-w-md w-full">
           <div className="mb-8 text-center">
             <h1 className="text-3xl font-serif text-stone-900 mb-2">Complete Payment</h1>
             <p className="text-stone-500">Order #{checkoutData.data.order_id}</p>
           </div>
           
           <KhqrPayment 
             orderId={checkoutData.data.order_id} 
             initialKhqr={checkoutData.data.khqr} 
           />
           
           <div className="mt-8 text-center">
             <Button variant="ghost" asChild className="text-stone-500 hover:text-stone-900">
               <Link href="/cart">Back to Cart</Link>
             </Button>
           </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (!isCartLoading && cart.items.length === 0 && !checkoutData) {
      router.replace('/cart')
    }
  }, [isCartLoading, cart.items.length, checkoutData, router])

  if (isCartLoading && cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (cart.items.length === 0 && !checkoutData) {
    return null
  }

  return (
    <div className="bg-[#FBF9F7] min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <Link 
          href="/cart" 
          className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-stone-900 mb-8 transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Shopping Bag
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Shipping Address */}
            <section className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600">
                  <MapPin size={20} />
                </div>
                <h2 className="text-xl font-medium text-stone-900">Shipping Address</h2>
              </div>

              {isAddressesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div 
                      key={address.id}
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        selectedAddressId === address.id 
                          ? 'border-stone-900 bg-stone-50' 
                          : 'border-stone-100 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-stone-900">{address.label}</span>
                        {selectedAddressId === address.id && (
                          <div className="w-4 h-4 bg-stone-900 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-stone-500 leading-relaxed">
                        {address.street}, {address.city}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-xl">
                  <p className="text-stone-500 mb-4">No addresses found</p>
                  <Button variant="outline" size="sm" className="rounded-full">
                    Add New Address
                  </Button>
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-medium text-stone-900">Payment Method</h2>
              </div>

              <div className="p-4 rounded-xl border-2 border-stone-900 bg-stone-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-white border border-stone-200 rounded flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#E31E24]">KHQR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">Bakong KHQR</p>
                    <p className="text-xs text-stone-500 text-pretty">Scan to pay with any mobile banking app</p>
                  </div>
                </div>
                <div className="w-4 h-4 bg-stone-900 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>
              
              <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-xs">
                <Info size={14} className="shrink-0 mt-0.5" />
                <p>After clicking "Pay Now", a QR code will be generated for you to scan and pay.</p>
              </div>
            </section>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200 shadow-sm sticky top-24">
              <h2 className="text-xl font-serif mb-6 text-stone-900">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded bg-stone-50 overflow-hidden shrink-0">
                      {item.product.image && (
                        <img src={item.product.image} alt={item.product.name} className="object-cover w-full h-full" />
                      )}
                      <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-stone-500">{formatCurrency(item.product.price)}</p>
                    </div>
                    <div className="text-sm font-semibold text-stone-900">
                      {formatCurrency(item.line_total)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-stone-100">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="pt-3 border-t border-stone-100 flex justify-between font-bold text-lg text-stone-900">
                  <span>Total</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
              </div>

              <Button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddressId}
                className="w-full rounded-full py-6 h-auto text-base mt-8 shadow-lg shadow-stone-200"
              >
                {isPlacingOrder ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-5 w-5" />
                )}
                Pay Now
              </Button>

              <p className="mt-6 text-[10px] text-stone-400 text-center uppercase tracking-widest leading-relaxed">
                Secure SSL encrypted checkout <br />
                Terms and Conditions apply
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Loader2({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
