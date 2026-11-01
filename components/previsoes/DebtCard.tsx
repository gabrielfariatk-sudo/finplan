"use client";

import { CircleCheck, Lightbulb, ReceiptText } from "lucide-react";
import { formatBRL, formatDate } from "@/lib/expenses";
import { monthsUntil, progressPct, type DebtPlan } from "@/lib/plans";
import type { CalcConfig } from "@/lib/calcConfig";
import { horizonOf, HORIZON_LABEL } from "@/lib/rules";
import PlanCarousel, { ITEM_CLASS } from "./PlanCarousel";

const TONES = [
  { icon: "bg-cyan-500/20 text-cyan-300", text: "text-cyan-400", bar: "#22d3ee" },
  { icon: "bg-blue-500/20 text-blue-300", text: "text-blue-400", bar: "#60a5fa" },
];

function DebtRow({ debt, index, horizon }: { debt: DebtPlan; index: number; horizon?: string }) {
  const tone = TONES[index % TONES.length];
  const pct = progressPct(debt.paid, debt.total);

  return (
    <div
      className={`${ITEM_CLASS} flex items-center gap-3 rounded-xl border border-white/10
                  bg-white/5 px-3 py-2.5`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
        <ReceiptText className="h-4 w-4" strokeWidth={1.5} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-semibold">{debt.name}</p>
          {horizon && (
            <span className="shrink-0 rounded border border-white/20 px-1.5 text-[9px] text-white/60">{horizon}</span>
          )}
        </div>
        <p className="text-[10px] text-white/55">
          Dívida: {formatBRL(debt.total)} • {formatBRL(debt.monthly)}/mês
        </p>
        <p className="text-[10px] text-white/55">
          Já pago:{" "}
          <span className="font-semibold text-white/90">{formatBRL(debt.paid)}</span>
          {" • "}quitar até {formatDate(debt.endDate)}
        </p>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: tone.bar }}
          />
        </div>
      </div>
      <span className={`text-sm font-bold ${tone.text}`}>{pct}%</span>
    </div>
  );
}

export default function DebtCard({
  debts,
  onPlan,
  config,
}: {
  debts: DebtPlan[];
  onPlan: () => void;
  config?: CalcConfig;
}) {
  return (
    <section
      className="rounded-2xl border border-cyan-400/30 bg-linear-to-br
                 from-[#06223f]/80 to-[#0a0430]/90 p-5 text-white
                 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-md"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
                     bg-linear-to-br from-cyan-500 to-blue-600
                     shadow-[0_0_20px_rgba(34,211,238,0.4)]"
        >
          <CircleCheck className="h-7 w-7" strokeWidth={1.5} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Finalize Dívidas</h2>
            <span className="rounded-full border border-cyan-400/50 bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-200">
              Estratégia de Quitação
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-white/70">
            Crie um plano acelerado para eliminar passivos, economizar no
            pagamento de juros e liberar fluxo de caixa para seus investimentos.
          </p>
        </div>

        <button
          type="button"
          onClick={onPlan}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl
                     bg-linear-to-r from-cyan-600 to-blue-600 px-6 py-3
                     text-sm font-semibold shadow-[0_0_20px_rgba(34,211,238,0.3)]
                     transition-opacity hover:opacity-90"
        >
          <ReceiptText className="h-4 w-4" />
          Planejar Quitação
        </button>
      </div>

      {debts.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <PlanCarousel count={debts.length}>
            {debts.map((d, i) => (
              <DebtRow
                key={d.id}
                debt={d}
                index={i}
                horizon={config ? HORIZON_LABEL[horizonOf(monthsUntil(d.endDate), config)] : undefined}
              />
            ))}
          </PlanCarousel>
        </div>
      )}

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-400/40 bg-amber-500/5 px-3 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
          <Lightbulb className="h-4 w-4" />
        </span>
        <p className="text-xs leading-relaxed text-white/80">
          <strong className="text-amber-300">Dica Importante:</strong> Antes de
          planejar o encerramento de dívidas, lembre-se de registrar e garantir
          primeiramente os seus <u className="decoration-amber-400">gastos essenciais</u>{" "}
          (Moradia, Alimentação, Saúde). Isso garante estabilidade e evita novo
          endividamento durante o processo.
        </p>
      </div>
    </section>
  );
}