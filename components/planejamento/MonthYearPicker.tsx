"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MONTHS_SHORT, currentMonthValue, formatMonth } from "@/lib/incomes";

type Props = {
  id: string;
  value: string; // "yyyy-mm" ou ""
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function MonthYearPicker({
  id,
  value,
  onChange,
  placeholder = "Mês / Ano",
}: Props) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() =>
    value ? Number(value.slice(0, 4)) : new Date().getFullYear(),
  );
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

  function toggle() {
    if (!open) {
      setViewYear(value ? Number(value.slice(0, 4)) : new Date().getFullYear());
    }
    setOpen((v) => !v);
  }

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={ref} className={`relative ${open ? "z-30" : ""}`}>
      <button
        id={id}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex w-full items-center gap-2 rounded-md border bg-white
                    px-2.5 py-1.5 text-left text-xs transition-colors ${
                      open ? "border-purple-500" : "border-purple-200"
                    }`}
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#6d4fd6]" />
        <span
          className={`flex-1 truncate ${
            value ? "text-[#2a1d78]" : "text-[#4c3a9e]/60"
          }`}
        >
          {value ? formatMonth(value) : placeholder}
        </span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-[#4c3a9e] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Selecionar mês e ano"
          className="absolute left-0 top-full z-40 mt-1.5 w-64 rounded-xl border
                     border-purple-200 bg-white p-3
                     shadow-[0_12px_32px_rgba(91,63,191,0.3)]"
        >
          {/* Navegação de ano */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              aria-label="Ano anterior"
              className="rounded-full p-1 text-[#4c3a9e] hover:bg-purple-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-[#2a1d78]">
              {viewYear}
            </span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              aria-label="Próximo ano"
              className="rounded-full p-1 text-[#4c3a9e] hover:bg-purple-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Meses */}
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS_SHORT.map((label, m) => {
              const v = `${viewYear}-${String(m + 1).padStart(2, "0")}`;
              const active = v === value;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => pick(v)}
                  aria-pressed={active}
                  className={`rounded-lg py-1.5 text-xs transition-colors ${
                    active
                      ? "bg-linear-to-r from-purple-600 to-violet-600 font-medium text-white"
                      : "text-[#2a1d78] hover:bg-purple-100"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Rodapé */}
          <div className="mt-2 flex justify-between border-t border-purple-100 pt-2">
            <button
              type="button"
              onClick={() => pick("")}
              className="rounded px-2 py-1 text-[11px] text-[#4c3a9e] hover:bg-purple-100"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => pick(currentMonthValue())}
              className="rounded px-2 py-1 text-[11px] font-medium text-[#6d4fd6] hover:bg-purple-100"
            >
              Mês atual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}