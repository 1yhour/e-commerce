"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { type Product } from "@/data/products";

interface NewArrivalsSectionProps {
  products: Product[];
}

export function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  const [wishlisted, setWishlisted] = useState<number[]>([]);

  const toggleWishlist = (id: number) =>
    setWishlisted((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <section className="w-full bg-white py-24 px-6 md:px-10 lg:px-16">
      {/* Section header */}
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

        <Link
          href="/products"
          className="text-[10px] tracking-[0.25em] uppercase text-stone-400 hover:text-black border-b border-stone-200 hover:border-black pb-1 transition-all duration-300 self-start md:self-auto"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          View All Pieces
        </Link>
      </div>

      {/* Product grid — 2 col mobile → 3 col tablet → 5 col desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-stone-100">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group relative bg-white overflow-hidden cursor-pointer"
          >
            {/* Portrait image */}
            <div className="relative overflow-hidden aspect-[3/4]">
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              />

              {/* Hover tint overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

              {/* Promo tag (New / Limited) */}
              {product.tag && (
                <span
                  className="absolute top-4 left-4 text-[9px] tracking-[0.2em] uppercase bg-white text-black px-3 py-1"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {product.tag}
                </span>
              )}

              {/* Wishlist button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(product.id);
                }}
                className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Add to wishlist"
              >
                <Heart
                  className="w-4 h-4 transition-colors duration-200"
                  strokeWidth={1.5}
                  fill={wishlisted.includes(product.id) ? "black" : "none"}
                  stroke={wishlisted.includes(product.id) ? "black" : "white"}
                />
              </button>

              {/* Quick Add — slides up on hover */}
              <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                <button
                  className="w-full py-3 bg-white text-black text-[10px] tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors duration-300"
                  style={{ fontFamily: "var(--font-sans)" }}
                  onClick={(e) => e.preventDefault()}
                >
                  Quick Add
                </button>
              </div>
            </div>

            {/* Product info strip */}
            <div className="pt-4 pb-6 px-2">
              <p
                className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-1"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {product.category}
              </p>
              <h3
                className="text-base font-normal text-black mb-1.5 leading-snug"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {product.name}
              </h3>
              <p
                className="text-[11px] text-stone-500 tracking-wide"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {product.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
