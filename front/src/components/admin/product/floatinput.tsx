export function FloatInput({
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