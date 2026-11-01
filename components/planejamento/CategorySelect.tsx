"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Tag } from "lucide-react";
import { ICONS, type Category } from "@/lib/categories";

type Props = {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
};

export default function CategorySelect({ categories, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = categories.find((c) => c.id === value);
  const SelectedIcon = selected ? (ICONS[selected.icon] ?? ICONS.ellipsis) : null;

  return (
    <div ref={ref} className={`relative ${open ? "z-30" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-2 rounded-md border bg-white
                    px-2.5 py-1.5 text-left text-xs transition-colors ${
                      open ? "border-purple-500" : "border-purple-200"
                    }`}
      >
        {selected && SelectedIcon ? (
          <>
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: selected.color }}
            >
              <SelectedIcon className="h-2.5 w-2.5 text-white" />
            </span>
            <span className="flex-1 truncate text-[#2a1d78]">
              {selected.name}
            </span>
          </>
        ) : (
          <>
            <Tag className="h-3.5 w-3.5 shrink-0 text-[#6d4fd6]" />
            <span className="flex-1 truncate text-[#4c3a9e]/60">
              Selecione uma categoria
            </span>
          </>
        )}
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-[#4c3a9e] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-40 mt-1.5 max-h-56 w-full
                     overflow-y-auto rounded-xl border border-purple-200
                     bg-white p-1.5 shadow-[0_12px_32px_rgba(91,63,191,0.3)]"
        >
          {categories.length === 0 && (
            <p className="px-3 py-2 text-xs text-[#4c3a9e]/70">
              Nenhuma categoria cadastrada.
            </p>
          )}
          {categories.map((cat) => {
            const Icon = ICONS[cat.icon] ?? ICONS.ellipsis;
            const active = cat.id === value;
            return (
              <button
                key={cat.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(cat.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5
                            text-left text-xs transition-colors ${
                              active
                                ? "bg-purple-100 font-medium text-[#2a1d78]"
                                : "text-[#2a1d78] hover:bg-purple-50"
                            }`}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                  style={{ backgroundColor: cat.color }}
                >
                  <Icon className="h-3 w-3 text-white" />
                </span>
                <span className="flex-1 truncate">{cat.name}</span>
                {active && <Check className="h-3 w-3 shrink-0 text-purple-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}