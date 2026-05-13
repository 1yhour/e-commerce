'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle2, Loader2, RefreshCw, AlertCircle, Clock } from 'lucide-react'
import { checkoutApi, type KhqrData, type PaymentStatus } from '@/lib/api/cart'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

interface Props {
  orderId: string
  initialKhqr: KhqrData
}

export default function KhqrPayment({ orderId, initialKhqr }: Props) {
  const router = useRouter()
  const [khqr, setKhqr] = useState<KhqrData>(initialKhqr)
  const [status, setStatus] = useState<'pending' | 'paid' | 'expired' | 'failed'>('pending')
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Calculate time remaining
  useEffect(() => {
    const calculateTime = () => {
      const expiry = new Date(khqr.expires_at).getTime()
      const now = new Date().getTime()
      const diff = Math.max(0, Math.floor((expiry - now) / 1000))
      setTimeLeft(diff)
      if (diff === 0 && status === 'pending') {
        setStatus('expired')
      }
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [khqr, status])

  // Poll status
  useEffect(() => {
    if (status !== 'pending') return

    const poll = async () => {
      try {
        const data = await checkoutApi.pollStatus(orderId)
        if (data.khqr_status === 'paid') {
          setStatus('paid')
          toast.success('Payment received! Redirecting...')
          setTimeout(() => {
            router.push(`/orders/${orderId}/success`)
          }, 2000)
        } else if (data.khqr_status === 'expired') {
          setStatus('expired')
        } else if (data.khqr_status === 'failed') {
          setStatus('failed')
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    const interval = setInterval(poll, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [orderId, status, router])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const newKhqr = await checkoutApi.refreshQr(orderId)
      setKhqr(newKhqr)
      setStatus('pending')
      toast.success('QR Code refreshed')
    } catch (error) {
      toast.error('Failed to refresh QR code')
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(khqr.qr_string)}&size=300x300`

  if (status === 'paid') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
          <CheckCircle2 size={48} />
        </div>
        <h3 className="text-2xl font-serif text-stone-900">Payment Successful</h3>
        <p className="text-stone-500">Thank you for your purchase. Your order is being processed.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-stone-200">
      <div className="flex items-center gap-2 mb-6">
        <Image src="/bakong-logo.png" alt="Bakong" width={24} height={24} className="rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <span className="font-bold text-lg tracking-tight text-[#E31E24]">KHQR</span>
      </div>

      <div className="relative group">
        <div className={`transition-opacity duration-300 ${status !== 'pending' ? 'opacity-20 grayscale' : 'opacity-100'}`}>
           <div className="p-4 bg-white border-2 border-stone-100 rounded-xl shadow-sm">
             {/* Using an external QR API since we don't have a local library installed */}
             <img src={qrUrl} alt="KHQR Code" className="w-64 h-64" />
           </div>
        </div>

        {status === 'expired' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
            <AlertCircle className="text-amber-500 mb-2" size={40} />
            <p className="font-medium text-stone-900 mb-4">QR Code Expired</p>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" className="rounded-full">
              {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh QR
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 w-full space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-stone-500">Amount to pay</span>
          <span className="font-semibold text-stone-900">{formatCurrency(khqr.amount)}</span>
        </div>

        {status === 'pending' && (
          <div className="flex items-center justify-center gap-2 py-2 px-4 bg-stone-50 rounded-lg text-stone-600 text-sm font-medium">
            <Clock size={16} />
            <span>Expires in {formatTime(timeLeft)}</span>
          </div>
        )}

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-stone-400 text-xs mt-2">
            <Loader2 className="animate-spin" size={12} />
            <span>Waiting for payment...</span>
          </div>
        </div>
      </div>
      
      <p className="mt-6 text-[10px] text-stone-400 text-center uppercase tracking-widest">
        Scan with any mobile banking app
      </p>
    </div>
  )
}
