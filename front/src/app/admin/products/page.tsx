"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, ChevronUp, ChevronDown, Package, Loader2 } from "lucide-react";
import { getProducts, createProduct, updateProduct, deleteProduct as apiDeleteProduct } from "@/lib/api";
import type { Product, ProductFormData } from "@/data/adminProducts";
import { StockBadge } from "@/components/admin/product/stockbadge";
import { ProductModal } from "@/components/admin/product/productmodal";
import { DeleteModal } from "@/components/admin/product/deletemodal";
import { toast } from "sonner";

type SortKey = "title" | "price" | "stock_quantity";

const CATEGORY_MAP: Record<string, string> = {
  "987e6543-e21b-12d3-a456-426614174000": "Women",
  "123e4567-e89b-12d3-a456-426614174000": "Men",
  "550e8400-e29b-41d4-a716-446655440000": "Kids",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortAsc, setSortAsc] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      // Laravel returns data in response.data because of pagination or direct collection
      const productsData = data.data || data;
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter + sort
  const filtered = (products || [])
    .filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryName = p.category_id ? CATEGORY_MAP[p.category_id] : "Uncategorized";
      const matchCat = categoryFilter === "All" || categoryName === categoryFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortKey === "title") return dir * a.title.localeCompare(b.title);
      if (sortKey === "price") return dir * (a.price - b.price);
      return dir * (a.stock_quantity - b.stock_quantity);
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
    ) : (
      <ChevronUp className="w-3 h-3 opacity-20" />
    );

  // CRUD handlers
  const handleSave = async (formData: FormData) => {
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, formData);
        toast.success("Product updated successfully");
      } else {
        await createProduct(formData);
        toast.success("Product created successfully");
      }
      setShowAdd(false);
      setEditProduct(null);
      fetchProducts(); // Refresh list
    } catch (error: any) {
      console.error("Failed to save product:", error);
      const message = error.response?.data?.message || error.message || "Failed to save product";
      toast.error(message);
      throw error; // Re-throw to let the modal catch validation errors
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      await apiDeleteProduct(deleteProduct.id);
      toast.success("Product deleted successfully");
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
      setDeleteProduct(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Stats
  const totalValue = (products || []).reduce((s, p) => s + (Number(p.price) || 0) * (p.stock_quantity || 0), 0);
  const outOfStock = (products || []).filter((p) => p.stock_quantity === 0).length;
  const lowStock = (products || []).filter((p) => p.stock_quantity > 0 && p.stock_quantity < 15).length;

  return (
    <div className="min-h-full bg-stone-50 p-6 md:p-10">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-1">Inventory</p>
          <h1 className="text-3xl font-normal text-stone-900" style={{ fontFamily: "var(--font-serif)" }}>
            Products
          </h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-[11px] tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Add Product
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Products", value: products?.length || 0, icon: Package },
          { label: "Inventory Value", value: `$${totalValue.toLocaleString()}`, icon: null },
          { label: "Out of Stock", value: outOfStock, danger: true, icon: null },
          { label: "Low Stock", value: lowStock, warn: true, icon: null },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-5 border border-stone-100">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-2">{stat.label}</p>
            <p
              className={`text-2xl font-light ${
                stat.danger ? "text-rose-500" : stat.warn ? "text-amber-500" : "text-stone-900"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters bar ─────────────────────────────────────────── */}
      <div className="bg-white border border-stone-100 px-5 py-4 flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-6 py-2 text-sm bg-transparent border-0 border-b border-stone-200 focus:border-stone-700 outline-none text-stone-800 placeholder:text-stone-300 transition-colors"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-[11px] tracking-[0.1em] uppercase text-stone-500 border border-stone-200 bg-white px-4 py-2 outline-none focus:border-stone-700 transition-colors"
        >
          <option value="All">All Categories</option>
          {Object.values(CATEGORY_MAP).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <span className="text-[11px] text-stone-400 ml-auto whitespace-nowrap">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="bg-white border border-stone-100 overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-0 border-b border-stone-100 px-6 py-3 bg-stone-50/50">
          {[
            { label: "Product", key: "title" as SortKey },
            { label: "Category", key: null },
            { label: "Status", key: null },
            { label: "Price", key: "price" as SortKey },
            { label: "Stock", key: "stock_quantity" as SortKey },
          ].map((col) => (
            <button
              key={col.label}
              onClick={() => col.key && toggleSort(col.key)}
              disabled={!col.key}
              className={`flex items-center gap-1 text-[10px] tracking-[0.2em] uppercase text-stone-400 text-left transition-colors ${
                col.key ? "hover:text-stone-700 cursor-pointer" : "cursor-default"
              }`}
            >
              {col.label}
              {col.key && <SortIcon col={col.key} />}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center gap-4 text-stone-300">
            <Loader2 className="w-8 h-8 animate-spin" strokeWidth={1} />
            <p className="text-xs uppercase tracking-widest">Loading Inventory…</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-stone-50">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-0 px-6 py-4 items-center hover:bg-stone-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 overflow-hidden bg-stone-50 border border-stone-100">
                    {product.image ? (
                      <img
                        src={product.image.startsWith("http") ? product.image : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${product.image}`}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-stone-200" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-stone-900 font-normal leading-snug">{product.title}</p>
                    {product.tag && (
                      <span className="text-[9px] tracking-[0.15em] uppercase text-stone-400">{product.tag}</span>
                    )}
                  </div>
                </div>

                <span className="text-[11px] tracking-wide text-stone-400">
                  {product.category_id ? CATEGORY_MAP[product.category_id] : "Uncategorized"}
                </span>
                <div>
                  <StockBadge stock={product.stock_quantity} />
                </div>
                <span className="text-sm text-stone-700">${product.price}</span>

                <div className="flex items-center gap-5">
                  <span className="text-sm text-stone-500 w-8 text-right">{product.stock_quantity}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => setEditProduct(product)}
                      className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors rounded"
                      aria-label="Edit product"
                    >
                      <Edit className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setDeleteProduct(product)}
                      className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors rounded"
                      aria-label="Delete product"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center gap-3 text-stone-300">
            <Package className="w-8 h-8" strokeWidth={1} />
            <p className="text-sm tracking-wide">No products found</p>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {showAdd && <ProductModal mode="add" onClose={() => setShowAdd(false)} onSave={handleSave} />}
      {editProduct && (
        <ProductModal mode="edit" product={editProduct} onClose={() => setEditProduct(null)} onSave={handleSave} />
      )}
      {deleteProduct && (
        <DeleteModal product={deleteProduct} onClose={() => setDeleteProduct(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
}