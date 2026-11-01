"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown } from "lucide-react";
import {
  PRESETS,
  presetPeriod,
  type Period,
  type PresetKey,
} from "@/lib/dashboard";
import { formatDate } from "@/lib/expenses";

export type PeriodState = { key: PresetKey | "custom"; period: Period };

type Props = {
  value: PeriodState;
  onChange: (value: PeriodState) => void;
};

const DATE_INPUT =
  "w-full rounded-md border border-purple-400/40 bg-white/10 px-2 py-1.5 " +
  "text-xs text-white outline-none focus:border-purple-300 [color-scheme:dark]";

export default function PeriodFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(value.period.start);
  const [end, setEnd] = useState(value.period.end);
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
      setStart(value.period.start);
      setEnd(value.period.end);
    }
    setOpen((v) => !v);
  }

  function pickPreset(key: PresetKey) {
    onChange({ key, period: presetPeriod(key) });
    setOpen(false);
  }

  const invalid = !start || !end || start > end;

  function applyCustom() {
    if (invalid) return;
    onChange({ key: "custom", period: { start, end } });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex items-center gap-3 rounded-xl border bg-[#0c0533]/80 px-4 py-2
                    text-left text-white backdrop-blur-md transition-colors ${
                      open ? "border-purple-300" : "border-purple-400/40"
                    }`}
      >
        <CalendarDays className="h-5 w-5 text-purple-300" strokeWidth={1.5} />
        <span className="leading-tight">
          <span className="block text-[11px] text-white/60">Período</span>
          <span className="block text-xs font-semibold">
            {formatDate(value.period.start)} - {formatDate(value.period.end)}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-white/70 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Selecionar período"
          className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border
                     border-purple-400/40 bg-[#120a45] p-2
                     shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
        >
          <div className="space-y-0.5">
            {PRESETS.map((p) => {
              const active = value.key === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => pickPreset(p.key)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5
                              text-left text-xs transition-colors ${
                                active
                                  ? "bg-purple-600 font-medium text-white"
                                  : "text-white/85 hover:bg-white/10"
                              }`}
                >
                  {p.label}
                  {active && <Check className="h-3 w-3" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-white/10 px-1 pt-2">
            <p className="mb-1.5 text-[11px] font-medium text-white/70">
              Personalizado
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                aria-label="Data inicial"
                className={DATE_INPUT}
              />
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                aria-label="Data final"
                className={DATE_INPUT}
              />
            </div>
            {start && end && start > end && (
              <p className="mt-1 text-[10px] text-rose-300">
                A data final deve ser igual ou posterior à inicial.
              </p>
            )}
            <button
              type="button"
              onClick={applyCustom}
              disabled={invalid}
              className="mt-2 w-full rounded-md bg-linear-to-r from-purple-600 to-violet-600
                         py-1.5 text-xs font-medium text-white transition-opacity
                         hover:opacity-90 disabled:opacity-40"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}