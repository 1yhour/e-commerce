'use client'

import Image from 'next/image'
import { Minus, Plus, X } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import type { CartItem } from '@/lib/api/cart'

interface Props {
  item: CartItem
  compact?: boolean // true = dropdown row, false = full cart page row
}

export default function CartItemRow({ item, compact = false }: Props) {
  const { updateItem, removeItem } = useCartStore()

  const imgSize = compact ? 64 : 80

  return (
    <div className={`flex gap-3 ${compact ? 'py-3' : 'py-4'}`}>
      {/* Product image */}
      <div
        className="relative shrink-0 overflow-hidden rounded bg-[#F5F3F0]"
        style={{ width: imgSize, height: imgSize }}
      >
        {item.product.image ? (
          <Image
            src={item.product.image}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes={`${imgSize}px`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#C0B9B0] text-xs">
            No image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`truncate font-medium text-[#1A1A1A] leading-tight ${
              compact ? 'text-sm' : 'text-base'
            }`}
          >
            {item.product.name}
          </p>
          <button
            onClick={() => removeItem(item.id)}
            className="shrink-0 text-[#9A9490] hover:text-[#1A1A1A] transition-colors"
            aria-label="Remove item"
          >
            <X size={compact ? 14 : 16} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity controls */}
          <div className="flex items-center gap-2 border border-[#E8E4DF] rounded-full px-2 py-0.5">
            <button
              onClick={() =>
                item.quantity > 1
                  ? updateItem(item.id, item.quantity - 1)
                  : removeItem(item.id)
              }
              className="text-[#9A9490] hover:text-[#1A1A1A] transition-colors p-0.5"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="text-sm w-5 text-center font-medium text-[#1A1A1A]">
              {item.quantity}
            </span>
            <button
              onClick={() => updateItem(item.id, item.quantity + 1)}
              className="text-[#9A9490] hover:text-[#1A1A1A] transition-colors p-0.5"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Line total */}
          <span
            className={`font-semibold text-[#1A1A1A] ${
              compact ? 'text-sm' : 'text-base'
            }`}
          >
            ${item.line_total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}