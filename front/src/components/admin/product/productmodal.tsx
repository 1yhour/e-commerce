import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { FloatInput } from "./floatinput";
import type { Product, ProductFormData } from "@/data/adminProducts";

const MEN_CATEGORY_ID = process.env.NEXT_PUBLIC_MEN_CATEGORY_ID;
const WOMEN_CATEGORY_ID = process.env.NEXT_PUBLIC_WOMEN_CATEGORY_ID;
const KIDS_CATEGORY_ID = process.env.NEXT_PUBLIC_KIDS_CATEGORY_ID;
const emptyForm: ProductFormData = {
  title: "",
  slug: "",
  category_id: "",
  price: "",
  stock_quantity: "",
  description: "",
  is_active: true,
  image: null,

};
export function ProductModal({
  mode,
  product,
  onClose,
  onSave,
}: {
  mode: "add" | "edit";
  product?: Product;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductFormData>(
    product
      ? {
          title: product.title,
          slug: product.slug,
          category_id: product.category_id ?? "",
          price: String(product.price),
          stock_quantity: String(product.stock_quantity),
          description: product.description ?? "",
          is_active: product.is_active ?? true,
          image: product.image ?? null,
        }
      : emptyForm
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === "add" && form.title) {
      const generatedSlug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setForm((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [form.title, mode]);

  const set = (key: keyof ProductFormData) => (val: string | boolean | File | null) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    // Clear error for this field when user types
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async () => {
  // ✅ Guard required fields before hitting the API
  if (!form.title || !form.category_id || !form.price || !form.stock_quantity) {
    setErrors({
      ...(!form.title         && { title:          ["Title is required"] }),
      ...(!form.category_id   && { category_id:    ["Category is required"] }),
      ...(!form.price         && { price:          ["Price is required"] }),
      ...(!form.stock_quantity && { stock_quantity: ["Stock quantity is required"] }),
    });
    return;
  }

  setIsSubmitting(true);
  setErrors({});

  try {
    const formData = new FormData();

    // ✅ Required fields — always append
    formData.append("title",          form.title);
    formData.append("slug",           form.slug);
    formData.append("category_id",    form.category_id);
    formData.append("price",          form.price);
    formData.append("stock_quantity", form.stock_quantity);
    formData.append("is_active",      form.is_active ? "1" : "0");

    // ✅ Optional fields — only append if they have a value
    if (form.description) formData.append("description", form.description);

    // ✅ Image — only if user selected a file
    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    // ✅ No cast needed if onSave prop type is correct
    await onSave(formData);

  } catch (err: any) {
    if (err.response?.status === 422) {
      // Laravel validation errors
      setErrors(err.response.data.errors || {});
    } else {
      console.error("Submission error:", err);
    }
  } finally {
    setIsSubmitting(false);
  }
};
  const ErrorMessage = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <p className="text-[10px] text-rose-500 mt-1 uppercase tracking-tight">
        {errors[field][0]}
      </p>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg mx-4 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-stone-100 sticky top-0 bg-white z-10">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-1">
              {mode === "add" ? "New item" : "Edit item"}
            </p>
            <h2 className="text-2xl font-normal text-stone-900" style={{ fontFamily: "var(--font-serif)" }}>
              {mode === "add" ? "Add Product" : "Edit Product"}
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-300 hover:text-stone-700 transition-colors" disabled={isSubmitting}>
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">
          <div>
            <FloatInput id="title" label="Product Title" value={form.title} onChange={set("title")} />
            <ErrorMessage field="title" />
          </div>

          <div>
            <FloatInput id="slug" label="Slug (URL identifier)" value={form.slug} onChange={set("slug")} />
            <ErrorMessage field="slug" />
          </div>

          <div className="relative">
            <select
              value={form.category_id}
              onChange={(e) => set("category_id")(e.target.value)}
              className="w-full border-0 border-b border-stone-200 focus:border-stone-800 outline-none bg-transparent pt-5 pb-2 text-sm text-stone-900 appearance-none transition-colors duration-200"
            >
              <option value="" disabled>Select a category</option>
              <option value={WOMEN_CATEGORY_ID}>Women</option>
              <option value={MEN_CATEGORY_ID}>Men</option>
              <option value={KIDS_CATEGORY_ID}>Kids</option>
            </select>
            <label className="absolute top-0 left-0 text-[10px] tracking-[0.15em] uppercase text-stone-400">
              Category
            </label>
            <ErrorMessage field="category_id" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <FloatInput id="price" label="Price ($)" type="number" value={form.price} onChange={set("price")} />
              <ErrorMessage field="price" />
            </div>
            <div>
              <FloatInput id="stock_quantity" label="Stock Quantity" type="number" value={form.stock_quantity} onChange={set("stock_quantity")} />
              <ErrorMessage field="stock_quantity" />
            </div>
          </div>

          <div className="relative">
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder=" "
              className="w-full border-0 border-b border-stone-200 focus:border-stone-800 outline-none bg-transparent pt-5 pb-2 text-sm text-stone-900 min-h-[100px] resize-none transition-colors duration-200"
            />
            <label className="absolute top-0 left-0 text-[10px] tracking-[0.15em] uppercase text-stone-400">
              Description
            </label>
            <ErrorMessage field="description" />
          </div>

          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => set("is_active")(e.target.checked)}
              className="w-4 h-4 rounded-none border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
            />
            <label htmlFor="is_active" className="text-[10px] uppercase tracking-widest text-stone-600 cursor-pointer">
              Active (Visible in store)
            </label>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] tracking-[0.15em] uppercase text-stone-400">
              Product Image
            </label>
            <div className="flex items-start gap-6">
              <div className="relative group w-24 h-24 bg-stone-50 border border-dashed border-stone-200 flex items-center justify-center overflow-hidden">
                {form.image ? (
                  <>
                    <img
                      src={typeof form.image === "string" ? (form.image.startsWith('http') ? form.image : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${form.image}`) : URL.createObjectURL(form.image)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {!isSubmitting && (
                      <button
                        onClick={() => set("image")(null)}
                        className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-stone-300 text-[10px] uppercase tracking-wider text-center px-2">No Image</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) set("image")(file);
                  }}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-block px-4 py-2 border border-stone-200 text-[10px] uppercase tracking-wider text-stone-600 hover:bg-stone-50 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {form.image ? "Change Image" : "Upload Image"}
                </label>
                <ErrorMessage field="image" />
                <p className="mt-2 text-[9px] text-stone-400 leading-relaxed uppercase tracking-tight">
                  Recommended: 1000x1333px (3:4 ratio).<br />
                  JPG, PNG or WebP max 2MB.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-stone-100 sticky bottom-0 bg-white">
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-6 py-2.5 text-[11px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-stone-900 text-white text-[11px] tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors flex items-center gap-2 disabled:bg-stone-400 min-w-[160px] justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
                {mode === "add" ? "Add Product" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
