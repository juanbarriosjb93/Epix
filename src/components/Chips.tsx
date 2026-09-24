"use client";

export default function Chips({
  items,
  active,
  onChange,
}: {
  items: string[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {items.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition-colors ${
            active === c
              ? "bg-white text-black border-white"
              : "bg-white/5 border-white/10 text-zinc-300 hover:border-white/20"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
