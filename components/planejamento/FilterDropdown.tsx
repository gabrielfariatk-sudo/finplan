"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

export type DropdownOption = { value: number; label: string };

type Props = {
  icon?: ReactNode;
  label: string;
  value: number;
  options: DropdownOption[];
  onChange: (value: number) => void;
  columns?: 1 | 2;
};

export default function FilterDropdown({
  icon,
  label,
  value,
  options,
  onChange,
  columns = 1,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou apertar Esc
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

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${open ? "z-30" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5
                    text-[#2a1d78] backdrop-blur-md transition-colors
                    shadow-[0_4px_14px_rgba(91,63,191,0.18)] ${
                      open
                        ? "border-purple-500 bg-white"
                        : "border-purple-300/60 bg-white/75 hover:bg-white"
                    }`}
      >
        {icon}
        <span className="text-xs text-[#4c3a9e]">{label}</span>
        <span className="text-xs font-semibold">{selected?.label}</span>
        <ChevronDown
          className={`h-3 w-3 text-[#4c3a9e] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className={`absolute left-0 top-full z-40 mt-2 max-h-72 overflow-y-auto
                      rounded-xl border border-purple-200 bg-white/95 p-1.5
                      shadow-[0_12px_32px_rgba(91,63,191,0.3)] backdrop-blur-md
                      grid gap-1 ${
                        columns === 2
                          ? "w-72 grid-cols-2"
                          : "min-w-full grid-cols-1"
                      }`}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex items-center justify-between gap-2 rounded-lg
                            px-3 py-1.5 text-left text-xs transition-colors ${
                              active
                                ? "bg-linear-to-r from-purple-600 to-violet-600 font-medium text-white"
                                : "text-[#2a1d78] hover:bg-purple-100"
                            }`}
              >
                {opt.label}
                {active && <Check className="h-3 w-3 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}