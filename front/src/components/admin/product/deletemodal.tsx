import { AlertTriangle, Trash2 } from "lucide-react";
import type { Product } from "@/data/adminProducts";

export function DeleteModal({ product, onClose, onConfirm }: {
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
              <span className="text-stone-800 font-medium">{product.title}</span>?
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-700 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-6 py-2.5 bg-rose-500 text-white text-[11px] tracking-[0.2em] uppercase hover:bg-rose-600 transition-colors flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}