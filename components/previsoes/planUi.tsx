"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, type LucideIcon } from "lucide-react";
import { formatBRL } from "@/lib/expenses";
import type { PlanPreview } from "@/lib/plans";

export type Accent = "purple" | "cyan" | "emerald";

export const ACCENTS: Record<
  Accent,
  { border: string; iconBox: string; button: string; text: string }
> = {
  purple: {
    border: "border-purple-400/40",
    iconBox:
      "bg-linear-to-br from-purple-500 to-violet-700 shadow-[0_0_18px_rgba(139,92,246,0.5)]",
    button:
      "bg-linear-to-r from-purple-500 to-violet-600 shadow-[0_0_18px_rgba(139,92,246,0.45)]",
    text: "text-purple-300",
  },
  emerald: {
    border: "border-emerald-400/40",
    iconBox:
      "bg-linear-to-br from-emerald-500 to-teal-600 shadow-[0_0_18px_rgba(16,217,160,0.4)]",
    button:
      "bg-linear-to-r from-emerald-600 to-teal-600 shadow-[0_0_18px_rgba(16,217,160,0.3)]",
    text: "text-emerald-300",
  },
  cyan: {
    border: "border-cyan-400/40",
    iconBox:
      "bg-linear-to-br from-cyan-500 to-blue-600 shadow-[0_0_18px_rgba(34,211,238,0.4)]",
    button:
      "bg-linear-to-r from-cyan-600 to-blue-600 shadow-[0_0_18px_rgba(34,211,238,0.3)]",
    text: "text-cyan-300",
  },
};

export const M_LABEL = "mb-1 block text-xs font-medium text-white/80";
export const M_INPUT =
  "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs " +
  "text-white outline-none transition-colors placeholder:text-white/40 " +
  "focus:border-purple-300 [color-scheme:dark]";

export const GHOST_BUTTON =
  "rounded-lg px-4 py-2 text-xs text-white/75 transition-colors hover:bg-white/10";

export function primaryButton(accent: Accent) {
  return (
    `rounded-lg px-5 py-2 text-xs font-semibold text-white transition-opacity ` +
    `hover:opacity-90 disabled:opacity-40 disabled:shadow-none ${ACCENTS[accent].button}`
  );
}

export function ModalShell({
  title,
  subtitle,
  icon: Icon,
  accent,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: Accent;
  onClose: () => void;
  children: ReactNode;
}) {
  const a = ACCENTS[accent];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 md:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full max-w-lg rounded-2xl border bg-[#0c0533] p-5 text-white
                    shadow-[0_0_40px_rgba(124,58,237,0.35)] ${a.border}`}
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.iconBox}`}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="text-[11px] leading-snug text-white/60">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function MoneyInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/60">
        R$
      </span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        placeholder={placeholder}
        className={`${M_INPUT} pl-9`}
      />
    </div>
  );
}

export function FieldError({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-[11px] text-rose-300">{children}</p>;
}

// Tela em que o usuário vê o valor mensal e decide se confirma
export function ConfirmStep({
  accent,
  preview,
  intro,
  rows,
  note,
  confirmLabel,
  onBack,
  onConfirm,
}: {
  accent: Accent;
  preview: PlanPreview;
  intro: string;
  rows: [string, string][];
  note?: string;
  confirmLabel: string;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const a = ACCENTS[accent];
  const { months, monthly } = preview;

  return (
    <div>
      <p className="text-xs text-white/70">{intro}</p>

      <div className={`mt-3 rounded-xl border bg-white/5 p-4 text-center ${a.border}`}>
        <p className={`text-3xl font-bold ${a.text}`}>{formatBRL(monthly)}</p>
        <p className="mt-1 text-[11px] text-white/60">
          por mês, durante {months} {months === 1 ? "mês" : "meses"}
        </p>
      </div>

      <dl className="mt-4 space-y-2 rounded-xl bg-white/5 p-3 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-white/60">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      {note && <p className="mt-3 text-[11px] text-white/55">{note}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onBack} className={GHOST_BUTTON}>
          Voltar e editar
        </button>
        <button type="button" onClick={onConfirm} className={primaryButton(accent)}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}