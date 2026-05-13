"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string | number;
  title?: string;
  name?: string;
  price: number | string;
  slug: string;
  primary_image?: { image_url: string };
  image?: string;
  tag?: string;
  category?: { name: string } | string;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white animate-pulse">
      <div className="aspect-[3/4] bg-stone-100 w-full" />
      <div className="pt-4 pb-6 px-2 space-y-2">
        <div className="h-2 bg-stone-100 rounded w-1/3" />
        <div className="h-4 bg-stone-100 rounded w-3/4" />
        <div className="h-2 bg-stone-100 rounded w-1/4" />
      </div>
    </div>
  );
}// Then use it anywhere without hardcoding
const NEW_ARRIVAL_CATEGORY_ID = process.env.NEXT_PUBLIC_NEW_ARRIVAL_CATEGORY_ID!;
import { useRouter } from "next/navigation";

// ─── Main component ───────────────────────────────────────────────────────────
export function NewArrivalsSection() {
  const router = useRouter();
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [wishlisted, setWishlisted] = useState<string[]>([]);

  // Fetch latest 5 products on mount
  useEffect(() => {
    api
      .get("/products", { params: { category_id: NEW_ARRIVAL_CATEGORY_ID, sort: "latest", limit: 5 } })
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setProducts(Array.isArray(data) ? data.slice(0, 6) : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleWishlist = (id: string) =>
    setWishlisted((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const buildImageUrl = (product: Product): string | null => {
    const raw = product.primary_image?.image_url || product.image;
    if (!raw) return null;
    if (raw.startsWith("http")) return raw;
    return `${process.env.NEXT_PUBLIC_STORAGE_URL}/${raw.replace(/^\//, "")}`;
  };

  const buildPrice = (price: number | string): string => {
    const num = typeof price === "number" ? price : parseFloat(price);
    return isNaN(num) ? String(price) : `$${num.toFixed(2)}`;
  };

  const buildCategory = (cat: Product["category"]): string => {
    if (!cat) return "";
    return typeof cat === "object" ? cat.name : cat;
  };

  return (
    <section className="w-full bg-white py-24 px-6 md:px-10 lg:px-16">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-4">
        <div>
          <p
            className="text-[10px] tracking-[0.35em] uppercase text-stone-400 mb-3"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Season 2026
          </p>
          <h2
            className="text-5xl md:text-6xl font-normal text-black"
            style={{ fontFamily: "var(--font-serif)", letterSpacing: "0.02em" }}
          >
            New Arrivals
          </h2>
        </div>

        {/* View All — only show once products have loaded */}
        {!loading && products.length > 0 && (
          <Link
            href="/newarrival"
            className="text-[10px] tracking-[0.25em] uppercase text-stone-400 hover:text-black border-b border-stone-200 hover:border-black pb-1 transition-all duration-300 self-start md:self-auto"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            View All Pieces →
          </Link>
        )}
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-stone-100">

        {/* Loading skeletons — always exactly 6 */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        }

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white">
            <p className="text-stone-300 text-[11px] tracking-[0.3em] uppercase">
              New arrivals coming soon
            </p>
          </div>
        )}

        {/* Product cards — max 6 */}
        {!loading &&
          products.map((product) => {
            const id       = String(product.id);
            const title    = product.title || product.name || "";
            const price    = buildPrice(product.price);
            const imageUrl = buildImageUrl(product);
            const category = buildCategory(product.category);
            const isWished = wishlisted.includes(id);

            return (
              <Link
                key={id}
                href={`/products/${product.slug ?? id}`}
                className="group relative bg-white overflow-hidden cursor-pointer"
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[3/4]">
                  {imageUrl ? (
                    <div className="absolute inset-0">
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
                      <span className="text-stone-300 text-[10px] tracking-widest uppercase">
                        No image
                      </span>
                    </div>
                  )}

                  {/* Hover tint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                  {/* Tag badge */}
                  {product.tag && (
                    <span className="absolute top-4 left-4 text-[9px] tracking-[0.2em] uppercase bg-white text-black px-3 py-1">
                      {product.tag}
                    </span>
                  )}

                  {/* Wishlist */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(id);
                    }}
                    className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      className="w-4 h-4 transition-colors duration-200"
                      strokeWidth={1.5}
                      fill={isWished ? "black" : "none"}
                      stroke={isWished ? "black" : "white"}
                    />
                  </button>

                  {/* Quick add */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    <button
                      className="w-full py-3 bg-white text-black text-[10px] tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          await useCartStore.getState().addItem(id, 1);
                          toast.success(`${title} added to bag`);
                          router.push('/checkout');
                        } catch (err) {
                          toast.error("Failed to add item to bag");
                        }
                      }}
                    >
                      Quick Add
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="pt-4 pb-6 px-2">
                  {category && (
                    <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-1">
                      {category}
                    </p>
                  )}
                  <h3
                    className="text-base font-normal text-black mb-1.5 leading-snug"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {title}
                  </h3>
                  <p className="text-[11px] text-stone-500 tracking-wide">
                    {price}
                  </p>
                </div>
              </Link>
            );
          })}
      </div>

      {/* ── Mobile "View All" button — below grid on small screens ─────────── */}
      {!loading && products.length > 0 && (
        <div className="mt-10 flex justify-center lg:hidden">
          <Link
            href="/newarrival"
            className="px-10 py-3 border border-stone-900 text-[10px] tracking-[0.25em] uppercase text-stone-900 hover:bg-stone-900 hover:text-white transition-colors duration-300"
          >
            View All Pieces
          </Link>
        </div>
      )}
    </section>
  );
}