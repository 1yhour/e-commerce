export function StockBadge({ stock }: { stock: number }) {
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