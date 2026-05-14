'use client'

import React, { useState, useEffect, use } from "react"
import { Plus, Minus, Loader2, ShoppingBag} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getProduct } from "@/lib/api"
import { useCartStore } from "@/stores/cartStore"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  id: string
  title: string
  name?: string
  description: string
  price: string | number
  stock_quantity: number
  slug: string
  primary_image?: {
    image_url: string
  }
  category?: {
    name: string
  }
}

// ─── Simple Accordion Helper ──────────────────────────────────────────────────
function AccordionRow({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-stone-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left hover:text-stone-600 transition-colors"
      >
        <span className="text-sm font-medium text-stone-900 uppercase tracking-widest">{title}</span>
        {isOpen ? <Minus className="w-4 h-4 text-stone-400" strokeWidth={1.5} /> : <Plus className="w-4 h-4 text-stone-400" strokeWidth={1.5} />}
      </button>
      {isOpen && (
        <div className="pb-5 text-sm text-stone-500 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function ProductDetailPage({ params: paramsPromise}: { params: Promise<{ id: string }>}) {
  const params = use(paramsPromise)
  const router = useRouter()
  const { addItem } = useCartStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(params.id)
        setProduct(data)
      } catch (err) {
        console.error("Failed to fetch product:", err)
        toast.error("Product not found")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id])

  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  const handleIncrease = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity((prev) => prev + 1)
    }
  }

  const onAddToCart = async (redirect = false) => {
    if (!product) return
    if (redirect) setIsBuyingNow(true); else setIsAdding(true);
    
    try {
      await addItem(product.id, quantity)
      toast.success(`${product.title || product.name} added to bag`)
      if (redirect) {
        router.push('/checkout')
      }
    } catch (err) {
      toast.error("Failed to add to bag")
    } finally {
      setIsAdding(false)
      setIsBuyingNow(false)
    }
  }

  const buildImageUrl = (p: Product): string | null => {
    const raw = p.primary_image?.image_url
    if (!raw) return null
    if (raw.startsWith("http")) return raw
    return `${process.env.NEXT_PUBLIC_STORAGE_URL}/${raw.replace(/^\//, "")}`
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-12 w-1/3" />
            <div className="space-y-4 pt-8">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
        <p className="text-stone-500 mb-8">The piece you're looking for doesn't exist or has been removed.</p>
        <Button asChild variant="outline" className="rounded-none px-8">
          <Link href="/newarrival">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  const imageUrl = buildImageUrl(product)
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
  const currentTotal = price * quantity

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-16 pt-16 md:pt-20 ">
        
        {/* Back Button */}
        <div className="px-6 md:px-12 pt-6 pb-2">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-stone-400">
            <Link href="/" className="hover:text-stone-700 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-stone-700">{product.title}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* ─── LEFT: Product Image ────────────────────────────────────────── */}
          <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden group">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.title || product.name || ""}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-stone-300 text-[10px] tracking-widest uppercase">No Image Available</span>
              </div>
            )}
          </div>

          {/* ─── RIGHT: Product Details ─────────────────────────────────────── */}
          <div className="flex flex-col">
            
            {/* Header section */}
            <div className="mb-10">
              <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-4">
                {product.category?.name || "Collection 2026"}
              </p>
              <h1 className="text-3xl md:text-5xl font-normal text-stone-900 mb-6 leading-tight font-serif">
                {product.title || product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <p className="text-3xl font-light text-stone-900">
                  {formatCurrency(price)}
                </p>
                {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                   <span className="text-[10px] tracking-widest uppercase text-amber-600 bg-amber-50 px-2 py-1">
                     Only {product.stock_quantity} left
                   </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-10">
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-4">Quantity</p>
              <div className="flex items-center justify-between border border-stone-200 w-full md:w-48 h-14 px-4">
                <button
                  onClick={handleDecrease}
                  className="p-2 text-stone-400 hover:text-stone-900 transition-colors disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
                <span className="text-sm font-medium text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  className="p-2 text-stone-400 hover:text-stone-900 transition-colors disabled:opacity-30"
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              <Button
                onClick={() => onAddToCart(true)}
                disabled={isBuyingNow || isAdding || product.stock_quantity === 0}
                variant="outline"
                className="w-full h-14 rounded-none border-stone-900 text-stone-900 text-[10px] tracking-[0.2em] uppercase hover:bg-stone-900 hover:text-white transition-all duration-300"
              >
                {isBuyingNow ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buy Now"}
              </Button>
              <Button
                onClick={() => onAddToCart(false)}
                disabled={isAdding || isBuyingNow || product.stock_quantity === 0}
                className="w-full h-14 rounded-none bg-stone-900 hover:bg-black text-white text-[10px] tracking-[0.2em] uppercase shadow-lg shadow-stone-200 transition-all duration-300"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={14} strokeWidth={1.5} />
                    Add To Bag — {formatCurrency(currentTotal)}
                  </div>
                )}
              </Button>
            </div>

            {/* Description */}
            <div className="mb-12">
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-4 border-b border-stone-100 pb-2">Description</p>
              <p className="text-sm text-stone-600 leading-relaxed font-light">
                {product.description || "No description available for this exquisite piece."}
              </p>
            </div>

            {/* Accordions */}
            <div className="border-t border-stone-200">
              <AccordionRow title="Shipping & Returns">
                <p>Complimentary standard shipping on all orders over $500. Returns are accepted within 14 days of delivery for a full refund or exchange, provided the item is in its original condition.</p>
              </AccordionRow>
              <AccordionRow title="Material & Care">
                <p>Each piece is crafted using premium materials sourced globally. To maintain the longevity of your purchase, please follow the care instructions provided with the product.</p>
              </AccordionRow>
              <AccordionRow title="Sustainability">
                <p>Our commitment to the environment means using ethically sourced materials and reducing our carbon footprint through localized manufacturing and plastic-free packaging.</p>
              </AccordionRow>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
