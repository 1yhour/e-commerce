"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ShoppingBag, Grid2X2, Grid3X3, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────
type Product = {
  id: string;
  title: string;
  slug: string;
  price: string;
  primary_image?: {
    image_url: string;
  };
  tag?: string;
  is_active: boolean;
  stock_quantity: number;
};

type FilterState = {
  sort: string;
  size: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function fetchProducts(categoryId: string, filters: FilterState): Promise<Product[]> {
  const params = new URLSearchParams({
    category_id: categoryId,
    sort: filters.sort,
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?${params}`,
    {
      credentials: "include",
      headers: { Accept: "application/json" },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch products");
  const json = await res.json();
  // Support both paginated data (json.data) and direct array responses
  return (json.data || json || []) as Product[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 border border-stone-200 px-4 py-2 text-[11px] tracking-[0.2em] uppercase text-stone-600 hover:border-stone-800 transition-colors"
      >
        {selected ? selected.label : label}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-stone-200 z-30 min-w-[160px] shadow-sm">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 text-[11px] tracking-[0.15em] uppercase transition-colors
                ${value === opt.value
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-50"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  size,
}: {
  product: Product;
  size: "lg" | "sm";
}) {
  const router = useRouter();
  const [wished, setWished] = useState(false);
  
  // This is already correct in your file ✅
const imageUrl = product.primary_image?.image_url
  ? (product.primary_image.image_url.startsWith('http')
      ? product.primary_image.image_url                              // full URL
      : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${product.primary_image.image_url}`) // relative path
  : null;
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden bg-stone-50 aspect-[3/4]">
        {product.tag && (
          <span className="absolute top-3 left-3 z-10 bg-stone-900 text-white text-[9px] tracking-[0.2em] uppercase px-2 py-1">
            {product.tag}
          </span>
        )}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-100">
            <span className="text-stone-300 text-[10px] tracking-widest uppercase">
              No image
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={async (e) => {
              e.preventDefault();
              try {
                await useCartStore.getState().addItem(product.id, 1);
                toast.success(`${product.title} added to bag`);
                router.push('/checkout');
              } catch (err) {
                toast.error("Failed to add item to bag");
              }
            }}
            className="w-full bg-white/90 backdrop-blur-sm text-stone-900 flex items-center justify-center gap-2 py-3 text-[10px] tracking-[0.2em] uppercase hover:bg-stone-900 hover:text-white transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
            Quick Add
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p
          className={`text-stone-800 uppercase tracking-wide font-normal leading-tight
            ${size === "sm" ? "text-[10px]" : "text-[11px]"}`}
        >
          {product.title}
        </p>
        <p
          className={`text-stone-600 ${size === "sm" ? "text-xs" : "text-sm"}`}
        >
          ${parseFloat(product.price).toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-stone-100 aspect-[3/4] w-full" />
      <div className="mt-3 space-y-2">
        <div className="h-2.5 bg-stone-100 rounded w-3/4" />
        <div className="h-2.5 bg-stone-100 rounded w-1/3" />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function CategoryPageContent({
  categoryName,
  categoryId,
}: {
  categoryName: string;
  categoryId: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridCols, setGridCols] = useState<4 | 5>(4);
  const [filters, setFilters] = useState<FilterState>({
    sort: "latest",
    size: "",
  });

  const setFilter = (key: keyof FilterState) => (val: string) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    setLoading(true);
    fetchProducts(categoryId, filters)
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [filters, categoryId]);

  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "price_asc", label: "Price: Low → High" },
    { value: "price_desc", label: "Price: High → Low" },
    { value: "name_asc", label: "A → Z" },
  ];

  const sizeOptions = [
    { value: "", label: "All sizes" },
    { value: "XS", label: "XS" },
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
  ];

  return (
    <div className="min-h-screen bg-white pt-16 md:pt-20">
      <div className="px-6 md:px-12 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-stone-400">
          <Link href="/" className="hover:text-stone-700 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-stone-700">{categoryName}</span>
        </nav>
      </div>

      <div className="sticky top-[64px] md:top-[80px] z-30 bg-white border-b border-stone-100 px-6 md:px-12 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <FilterDropdown
              label="Sort after"
              options={sortOptions}
              value={filters.sort}
              onChange={setFilter("sort")}
            />
            <FilterDropdown
              label="Size"
              options={sizeOptions}
              value={filters.size}
              onChange={setFilter("size")}
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-stone-400 tracking-wide hidden md:block">
              {loading ? "—" : `${products?.length || 0} products`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setGridCols(4)}
                className={`p-1 transition-colors ${
                  gridCols === 4 ? "text-stone-900" : "text-stone-300 hover:text-stone-500"
                }`}
                aria-label="4-column grid"
              >
                <Grid2X2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setGridCols(5)}
                className={`p-1 transition-colors ${
                  gridCols === 5 ? "text-stone-900" : "text-stone-300 hover:text-stone-500"
                }`}
                aria-label="5-column grid"
              >
                <Grid3X3 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 pt-8 pb-6">
        <h1
          className="text-4xl md:text-5xl font-normal text-stone-900 tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {categoryName}
        </h1>
        <p className="text-sm text-stone-400 mt-1 tracking-wide">
          {loading ? "" : `${products?.length || 0} styles`}
        </p>
      </div>

      <div className="px-6 md:px-12 pb-20">
        {loading ? (
          <div
            className={`grid gap-x-4 gap-y-10 ${
              gridCols === 4
                ? "grid-cols-2 md:grid-cols-4"
                : "grid-cols-2 md:grid-cols-5"
            }`}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-stone-300 text-[11px] tracking-[0.3em] uppercase mb-3">
              No products found
            </p>
            <p className="text-stone-400 text-sm">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-x-4 gap-y-10 ${
              gridCols === 4
                ? "grid-cols-2 md:grid-cols-4"
                : "grid-cols-2 md:grid-cols-5"
            }`}
          >
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                size={gridCols === 5 ? "sm" : "lg"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
