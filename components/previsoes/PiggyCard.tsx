"use client";

import { PiggyBank, PlusCircle, Target } from "lucide-react";
import { formatBRL, formatDate } from "@/lib/expenses";
import { monthsUntil, progressPct, type SavingsPlan } from "@/lib/plans";
import type { CalcConfig } from "@/lib/calcConfig";
import { horizonOf, HORIZON_LABEL } from "@/lib/rules";
import PlanCarousel, { ITEM_CLASS } from "./PlanCarousel";

const TONES = [
  { icon: "bg-purple-500/20 text-purple-300", text: "text-emerald-400", bar: "#10d9a0" },
  { icon: "bg-cyan-500/20 text-cyan-300", text: "text-cyan-400", bar: "#22d3ee" },
];

function GoalRow({ goal, index, horizon }: { goal: SavingsPlan; index: number; horizon?: string }) {
  const tone = TONES[index % TONES.length];
  const pct = progressPct(goal.saved, goal.target);

  return (
    <div
      className={`${ITEM_CLASS} flex items-center gap-3 rounded-xl border border-white/10
                  bg-white/5 px-3 py-2.5`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
        <Target className="h-4 w-4" strokeWidth={1.5} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-semibold">{goal.name}</p>
          {horizon && (
            <span className="shrink-0 rounded border border-white/20 px-1.5 text-[9px] text-white/60">{horizon}</span>
          )}
        </div>
        <p className="text-[10px] text-white/55">
          Meta: {formatBRL(goal.target)} • {formatBRL(goal.monthly)}/mês
        </p>
        <p className="text-[10px] text-white/55">
          Guardado:{" "}
          <span className="font-semibold text-white/90">{formatBRL(goal.saved)}</span>
          {" • "}até {formatDate(goal.targetDate)}
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

export default function PiggyCard({
  goals,
  onRegister,
  config,
}: {
  goals: SavingsPlan[];
  onRegister: () => void;
  config?: CalcConfig;
}) {
  return (
    <section
      className="rounded-2xl border border-purple-400/30 bg-linear-to-br
                 from-[#120a45]/90 to-[#0a0430]/90 p-5 text-white
                 shadow-[0_0_30px_rgba(124,58,237,0.2)] backdrop-blur-md"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
                     bg-linear-to-br from-purple-500 to-violet-700
                     shadow-[0_0_20px_rgba(139,92,246,0.5)]"
        >
          <PiggyBank className="h-7 w-7" strokeWidth={1.5} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Caixinha (Objetivos)</h2>
            <span className="rounded-full border border-purple-400/50 bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-200">
              Novo Planejamento
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-white/70">
            Vai fazer uma viagem? Um casamento? Comprar um carro? Se planeje
            antecipadamente e construa suas conquistas futuras com aportes
            recorrentes de forma inteligente. A reserva de emergência tem o
            seu próprio cartão acima.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegister}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl
                     bg-linear-to-r from-purple-500 to-violet-600 px-6 py-3
                     text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.45)]
                     transition-opacity hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" />
          Registrar Caixinha
        </button>
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        {goals.length === 0 ? (
          <p className="py-2 text-center text-xs text-white/50">
            Nenhuma caixinha criada ainda. Clique em &quot;Registrar Caixinha&quot; para começar.
          </p>
        ) : (
          <PlanCarousel count={goals.length}>
            {goals.map((g, i) => (
              <GoalRow
                key={g.id}
                goal={g}
                index={i}
                horizon={config ? HORIZON_LABEL[horizonOf(monthsUntil(g.targetDate), config)] : undefined}
              />
            ))}
          </PlanCarousel>
        )}
      </div>
    </section>
  );
}