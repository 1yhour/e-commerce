"use client";

import { useState } from "react";
import {
  Plus, Search, Edit, Trash2, X, ChevronUp, ChevronDown,
  Package, AlertTriangle, Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  tag: string | null;
}

// ─── Mock data (swap for API when ready) ─────────────────────────────────────
const initialProducts: Product[] = [
  {
    id: "1", name: "Silk Slip Dress",   category: "Women",
    price: 248, stock: 34,
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=200&auto=format&fit=crop",
    tag: "New",
  },
  {
    id: "2", name: "Oversized Blazer",  category: "Women",
    price: 195, stock: 12,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4871?q=80&w=200&auto=format&fit=crop",
    tag: null,
  },
  {
    id: "3", name: "Linen Trousers",    category: "Men",
    price: 165, stock: 0,
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=200&auto=format&fit=crop",
    tag: "New",
  },
  {
    id: "4", name: "Cashmere Knit",     category: "Women",
    price: 320, stock: 89,
    image: "https://images.unsplash.com/photo-1512327428383-f581b5a5bff7?q=80&w=200&auto=format&fit=crop",
    tag: null,
  },
  {
    id: "5", name: "Tailored Coat",     category: "Men",
    price: 485, stock: 7,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    tag: "Limited",
  },
];

const categories = ["Women", "Men", "Kids", "Accessories"];

// ─── Stock badge ──────────────────────────────────────────────────────────────
function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 bg-rose-50 text-rose-500 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
        Out of Stock
      </span>
    );
  if (stock < 15)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 bg-amber-50 text-amber-600 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        Low Stock
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 bg-emerald-50 text-emerald-600 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
      In Stock
    </span>
  );
}

// ─── Floating-label input ─────────────────────────────────────────────────────
function FloatInput({
  id, label, type = "text", value, onChange, placeholder,
}: {
  id: string; label: string; type?: string;
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full border-0 border-b border-stone-200 focus:border-stone-800 outline-none bg-transparent pt-5 pb-2 text-sm text-stone-900 placeholder-transparent transition-colors duration-200"
      />
      <label
        htmlFor={id}
        className="absolute top-5 left-0 text-stone-400 text-[10px] tracking-[0.15em] uppercase transition-all duration-200
          peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs
          peer-focus:top-0 peer-focus:text-[10px]
          peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[10px]"
      >
        {label}
      </label>
    </div>
  );
}

// ─── Product form (Add / Edit) ────────────────────────────────────────────────
interface ProductFormData {
  name: string; category: string; price: string; stock: string; image: string; tag: string;
}

const emptyForm: ProductFormData = {
  name: "", category: "Women", price: "", stock: "", image: "", tag: "",
};

function ProductModal({
  mode, product, onClose, onSave,
}: {
  mode: "add" | "edit";
  product?: Product;
  onClose: () => void;
  onSave: (data: ProductFormData) => void;
}) {
  const [form, setForm] = useState<ProductFormData>(
    product
      ? {
          name: product.name,
          category: product.category,
          price: String(product.price),
          stock: String(product.stock),
          image: product.image,
          tag: product.tag ?? "",
        }
      : emptyForm
  );

  const set = (key: keyof ProductFormData) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-stone-100">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-1">
              {mode === "add" ? "New item" : "Edit item"}
            </p>
            <h2 className="text-2xl font-normal text-stone-900" style={{ fontFamily: "var(--font-serif)" }}>
              {mode === "add" ? "Add Product" : "Edit Product"}
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-300 hover:text-stone-700 transition-colors">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Form */}
        <div className="px-8 py-6 space-y-5">
          <FloatInput id="name"  label="Product Name" value={form.name}  onChange={set("name")} />

          {/* Category select */}
          <div className="relative">
            <select
              value={form.category}
              onChange={(e) => set("category")(e.target.value)}
              className="w-full border-0 border-b border-stone-200 focus:border-stone-800 outline-none bg-transparent pt-5 pb-2 text-sm text-stone-900 appearance-none transition-colors duration-200"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label className="absolute top-0 left-0 text-[10px] tracking-[0.15em] uppercase text-stone-400">
              Category
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FloatInput id="price" label="Price ($)" type="number" value={form.price} onChange={set("price")} />
            <FloatInput id="stock" label="Stock"     type="number" value={form.stock} onChange={set("stock")} />
          </div>

          <FloatInput id="image" label="Image URL" value={form.image} onChange={set("image")} />

          {/* Tag */}
          <div className="relative">
            <select
              value={form.tag}
              onChange={(e) => set("tag")(e.target.value)}
              className="w-full border-0 border-b border-stone-200 focus:border-stone-800 outline-none bg-transparent pt-5 pb-2 text-sm text-stone-900 appearance-none transition-colors duration-200"
            >
              <option value="">None</option>
              <option value="New">New</option>
              <option value="Limited">Limited</option>
              <option value="Sale">Sale</option>
            </select>
            <label className="absolute top-0 left-0 text-[10px] tracking-[0.15em] uppercase text-stone-400">
              Tag (optional)
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[11px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-8 py-2.5 bg-stone-900 text-white text-[11px] tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5" strokeWidth={2} />
            {mode === "add" ? "Add Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteModal({ product, onClose, onConfirm }: {
  product: Product; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm mx-4 shadow-2xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 flex-shrink-0 bg-rose-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-500" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-normal text-stone-900 mb-1" style={{ fontFamily: "var(--font-serif)" }}>
              Delete Product
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              Are you sure you want to remove{" "}
              <span className="text-stone-800 font-medium">{product.name}</span>?
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-rose-500 text-white text-[11px] tracking-[0.2em] uppercase hover:bg-rose-600 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type SortKey = "name" | "price" | "stock";

export default function AdminProductsPage() {
  const [products, setProducts]           = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery]     = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortKey, setSortKey]             = useState<SortKey>("name");
  const [sortAsc, setSortAsc]             = useState(true);

  const [showAdd, setShowAdd]             = useState(false);
  const [editProduct, setEditProduct]     = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  // Filter + sort
  const filtered = products
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat    = categoryFilter === "All" || p.category === categoryFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortKey === "name")  return dir * a.name.localeCompare(b.name);
      if (sortKey === "price") return dir * (a.price - b.price);
      return dir * (a.stock - b.stock);
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      : <ChevronUp className="w-3 h-3 opacity-20" />;

  // CRUD handlers (UI-only — wire to API later)
  const handleAdd = (form: ProductFormData) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: form.name,
      category: form.category,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      image: form.image,
      tag: form.tag || null,
    };
    setProducts((prev) => [newProduct, ...prev]);
    setShowAdd(false);
  };

  const handleEdit = (form: ProductFormData) => {
    if (!editProduct) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editProduct.id
          ? {
              ...p,
              name: form.name,
              category: form.category,
              price: parseFloat(form.price) || 0,
              stock: parseInt(form.stock) || 0,
              image: form.image,
              tag: form.tag || null,
            }
          : p
      )
    );
    setEditProduct(null);
  };

  const handleDelete = () => {
    if (!deleteProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
    setDeleteProduct(null);
  };

  // Stats
  const totalValue  = products.reduce((s, p) => s + p.price * p.stock, 0);
  const outOfStock  = products.filter((p) => p.stock === 0).length;
  const lowStock    = products.filter((p) => p.stock > 0 && p.stock < 15).length;

  return (
    <div className="min-h-full bg-stone-50 p-6 md:p-10">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-1">
            Inventory
          </p>
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
          { label: "Total Products", value: products.length, icon: Package },
          { label: "Inventory Value", value: `$${totalValue.toLocaleString()}`, icon: null },
          { label: "Out of Stock",    value: outOfStock,  danger: true,  icon: null },
          { label: "Low Stock",       value: lowStock,    warn: true,    icon: null },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-5 border border-stone-100">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-2">
              {stat.label}
            </p>
            <p className={`text-2xl font-light ${stat.danger ? "text-rose-500" : stat.warn ? "text-amber-500" : "text-stone-900"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters bar ─────────────────────────────────────────── */}
      <div className="bg-white border border-stone-100 px-5 py-4 flex flex-col sm:flex-row gap-4 items-center mb-6">
        {/* Search */}
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

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-[11px] tracking-[0.1em] uppercase text-stone-500 border border-stone-200 bg-white px-4 py-2 outline-none focus:border-stone-700 transition-colors"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <span className="text-[11px] text-stone-400 ml-auto whitespace-nowrap">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="bg-white border border-stone-100 overflow-hidden">
        {/* Table head */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-0 border-b border-stone-100 px-6 py-3">
          {[
            { label: "Product", key: "name"  as SortKey },
            { label: "Category",  key: null },
            { label: "Status",    key: null },
            { label: "Price",     key: "price" as SortKey },
            { label: "Stock",     key: "stock" as SortKey },
          ].map((col) => (
            <button
              key={col.label}
              onClick={() => col.key && toggleSort(col.key)}
              disabled={!col.key}
              className={`flex items-center gap-1 text-[10px] tracking-[0.2em] uppercase text-stone-400 text-left transition-colors ${col.key ? "hover:text-stone-700 cursor-pointer" : "cursor-default"}`}
            >
              {col.label}
              {col.key && <SortIcon col={col.key} />}
            </button>
          ))}
        </div>

        {/* Rows */}
        {filtered.length > 0 ? (
          <div className="divide-y divide-stone-50">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-0 px-6 py-4 items-center hover:bg-stone-50 transition-colors group"
              >
                {/* Product */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 overflow-hidden bg-stone-100">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-stone-300" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-stone-900 font-normal leading-snug">{product.name}</p>
                    {product.tag && (
                      <span className="text-[9px] tracking-[0.15em] uppercase text-stone-400">{product.tag}</span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <span className="text-[11px] tracking-wide text-stone-400">{product.category}</span>

                {/* Status */}
                <div><StockBadge stock={product.stock} /></div>

                {/* Price */}
                <span className="text-sm text-stone-700">${product.price.toFixed(2)}</span>

                {/* Stock + actions */}
                <div className="flex items-center gap-5">
                  <span className="text-sm text-stone-500 w-8 text-right">{product.stock}</span>

                  {/* Action buttons — visible on row hover */}
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
      {showAdd && (
        <ProductModal mode="add" onClose={() => setShowAdd(false)} onSave={handleAdd} />
      )}
      {editProduct && (
        <ProductModal mode="edit" product={editProduct} onClose={() => setEditProduct(null)} onSave={handleEdit} />
      )}
      {deleteProduct && (
        <DeleteModal product={deleteProduct} onClose={() => setDeleteProduct(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
}