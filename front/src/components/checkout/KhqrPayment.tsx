'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { checkoutApi, type KhqrData } from '@/lib/api/cart'
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  Smartphone,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type PaymentState = 'waiting' | 'scanned' | 'paid' | 'expired' | 'error'

interface Props {
  orderId: string
  initialKhqr: KhqrData
  onPaymentSuccess: (orderId: string) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function secondsUntil(iso: string): number {
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000))
}

function formatCountdown(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function KhqrPayment({ orderId, initialKhqr, onPaymentSuccess }: Props) {
  const [khqr, setKhqr]               = useState<KhqrData>(initialKhqr)
  const [state, setState]             = useState<PaymentState>('waiting')
  const [countdown, setCountdown]     = useState(() => secondsUntil(initialKhqr.expires_at))
  const [isRefreshing, setRefreshing] = useState(false)
  const [pollError, setPollError]     = useState(false)

  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPaidRef    = useRef(false)

  // ── Stop all timers ──────────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    if (pollRef.current)      clearInterval(pollRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  // ── Countdown tick ───────────────────────────────────────────────────────
  const startCountdown = useCallback((expiresAt: string) => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(secondsUntil(expiresAt))

    countdownRef.current = setInterval(() => {
      const left = secondsUntil(expiresAt)
      setCountdown(left)
      if (left === 0) {
        clearInterval(countdownRef.current!)
        if (!isPaidRef.current) setState('expired')
      }
    }, 1000)
  }, [])

  // ── Polling ──────────────────────────────────────────────────────────────
  const startPolling = useCallback(
    (currentOrderId: string) => {
      if (pollRef.current) clearInterval(pollRef.current)

      pollRef.current = setInterval(async () => {
        try {
          const status = await checkoutApi.pollStatus(currentOrderId)
          setPollError(false)

          switch (status.khqr_status) {
            case 'scanned':
              setState('scanned')
              break

            case 'paid':
              if (!isPaidRef.current) {
                isPaidRef.current = true
                setState('paid')
                stopAll()
                // Brief pause so user sees the success state before redirect
                setTimeout(() => onPaymentSuccess(currentOrderId), 1800)
              }
              break

            case 'expired':
            case 'failed':
              setState('expired')
              stopAll()
              break
          }
        } catch {
          // Network blip — flag it, keep retrying next tick
          setPollError(true)
        }
      }, 3000)
    },
    [stopAll, onPaymentSuccess],
  )

  // ── Boot: kick off polling + countdown ──────────────────────────────────
  useEffect(() => {
    startPolling(orderId)
    startCountdown(khqr.expires_at)
    return stopAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Refresh expired QR ───────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const fresh = await checkoutApi.refreshQr(orderId)
      isPaidRef.current = false
      setKhqr(fresh)
      setState('waiting')
      setPollError(false)
      startCountdown(fresh.expires_at)
      startPolling(orderId)
    } catch {
      setState('error')
    } finally {
      setRefreshing(false)
    }
  }

  // ── State config map ─────────────────────────────────────────────────────
  const stateConfig: Record<
    PaymentState,
    { dot: string; label: string; labelColor: string; icon: React.ReactNode }
  > = {
    waiting: {
      dot: 'bg-blue-500 animate-pulse',
      label: 'Waiting for payment',
      labelColor: 'text-blue-600',
      icon: <Smartphone size={14} className="text-blue-500" />,
    },
    scanned: {
      dot: 'bg-amber-400 animate-pulse',
      label: 'Customer opened Bakong…',
      labelColor: 'text-amber-600',
      icon: <Smartphone size={14} className="text-amber-500" />,
    },
    paid: {
      dot: 'bg-emerald-500',
      label: 'Payment confirmed',
      labelColor: 'text-emerald-600',
      icon: <CheckCircle2 size={14} className="text-emerald-500" />,
    },
    expired: {
      dot: 'bg-red-400',
      label: 'QR code expired',
      labelColor: 'text-red-500',
      icon: <AlertTriangle size={14} className="text-red-400" />,
    },
    error: {
      dot: 'bg-red-400',
      label: 'Something went wrong',
      labelColor: 'text-red-500',
      icon: <AlertTriangle size={14} className="text-red-400" />,
    },
  }

  const cfg       = stateConfig[state]
  const qrDimmed  = state === 'expired' || state === 'error'
  const qrScanned = state === 'scanned'

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes khqr-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes khqr-success-pop {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes khqr-frame-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
          50%       { box-shadow: 0 0 0 8px rgba(59,130,246,0.12); }
        }
        .khqr-enter   { animation: khqr-fade-in 0.4s ease both; }
        .khqr-success { animation: khqr-success-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        .khqr-glow    { animation: khqr-frame-glow 2.5s ease-in-out infinite; }
      `}</style>

      <div className="khqr-enter flex flex-col items-center gap-5 w-full">

        {/* ── QR / State panel ──────────────────────────────────────── */}
        <div className="relative">
          {state === 'paid' ? (
            /* ── Success state replaces QR ── */
            <div className="khqr-success flex flex-col items-center justify-center w-[220px] h-[220px] rounded-2xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 size={64} className="text-emerald-500 mb-2" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-emerald-700">Payment Confirmed</p>
              <p className="text-xs text-emerald-500 mt-1">Redirecting…</p>
            </div>
          ) : (
            /* ── QR code frame ── */
            <div
              className={[
                'relative p-3 rounded-2xl border-2 transition-all duration-500',
                qrDimmed
                  ? 'border-[#E8E4DF] opacity-40 grayscale pointer-events-none'
                  : qrScanned
                  ? 'border-amber-300 khqr-glow'
                  : 'border-[#E8E4DF] khqr-glow',
              ].join(' ')}
            >
              {/* Corner decorations — viewfinder style */}
              {(
                [
                  'top-0 left-0',
                  'top-0 right-0 rotate-90',
                  'bottom-0 right-0 rotate-180',
                  'bottom-0 left-0 -rotate-90',
                ] as const
              ).map((pos) => (
                <span
                  key={pos}
                  className={`absolute ${pos} w-5 h-5 border-l-2 border-t-2 border-[#C9A96E] rounded-tl-sm`}
                />
              ))}

              <QRCodeSVG
                value={khqr.qr_string}
                size={194}
                bgColor="#FFFFFF"
                fgColor="#1A1A1A"
                level="M"
              />

              {/* Scanned overlay */}
              {qrScanned && (
                <div className="absolute inset-3 flex items-center justify-center rounded-xl bg-amber-50/70 backdrop-blur-[1px]">
                  <div className="flex flex-col items-center gap-1.5">
                    <Loader2 size={28} className="text-amber-500 animate-spin" />
                    <span className="text-[11px] font-medium text-amber-600">Confirming…</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Status badge ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F3F0] border border-[#E8E4DF]">
          <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
          {cfg.icon}
          <span className={`text-xs font-medium ${cfg.labelColor}`}>{cfg.label}</span>
          {pollError && (
            <span className="text-[10px] text-[#9A9490] ml-1">(retrying…)</span>
          )}
        </div>

        {/* ── Amount + countdown ────────────────────────────────────── */}
        {state !== 'paid' && (
          <div className="flex items-center justify-between w-full max-w-[280px]">
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-widest text-[#9A9490]">Amount</p>
              <p className="text-xl font-bold text-[#1A1A1A] mt-0.5 font-mono">
                ${khqr.amount.toFixed(2)}
                <span className="text-xs font-normal text-[#9A9490] ml-1">{khqr.currency}</span>
              </p>
            </div>

            <div className="w-px h-8 bg-[#E8E4DF]" />

            <div className="text-center">
              <p className="text-[11px] uppercase tracking-widest text-[#9A9490] flex items-center gap-1 justify-center">
                <Clock size={10} />
                Expires in
              </p>
              <p
                className={[
                  'text-xl font-bold mt-0.5 font-mono transition-colors duration-300',
                  state === 'expired'
                    ? 'text-red-500'
                    : countdown <= 60
                    ? 'text-amber-500'
                    : 'text-[#1A1A1A]',
                ].join(' ')}
              >
                {state === 'expired' ? '00:00' : formatCountdown(countdown)}
              </p>
            </div>
          </div>
        )}

        {/* ── Step-by-step instructions ─────────────────────────────── */}
        {(state === 'waiting' || state === 'scanned') && (
          <ol className="w-full max-w-[280px] space-y-1.5 text-xs text-[#6B6560]">
            {[
              'Open your Bakong app',
              'Tap "Scan" and point at the QR',
              'Confirm the payment amount',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-[#1A1A1A] text-white text-[9px] flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        )}

        {/* ── Refresh button (expired / error) ──────────────────────── */}
        {(state === 'expired' || state === 'error') && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1A1A] text-white text-sm font-medium
                       hover:bg-[#333] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {isRefreshing ? 'Generating new QR…' : 'Refresh QR Code'}
          </button>
        )}

        {/* ── Bakong branding ───────────────────────────────────────── */}
        <p className="text-[10px] text-[#B0AAA4] tracking-wide uppercase">
          Powered by NBC · Bakong KHQR
        </p>
      </div>
    </>
  )
}