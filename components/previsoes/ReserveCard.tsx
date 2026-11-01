"use client";

import { Check, Pause, Play, ShieldCheck, Settings2 } from "lucide-react";
import { formatBRL } from "@/lib/expenses";
import {
  levelRank,
  RESERVE_MILESTONES,
  type EmergencyReserve,
  type ReserveProgress,
  type ReserveStatus,
} from "@/lib/reserve";

export const fmtMonth = (key: string) => `${key.slice(5, 7)}/${key.slice(0, 4)}`;

const STATUS_BADGE: Record<ReserveStatus, { label: string; cls: string }> = {
  inactive: { label: "Desativada", cls: "border-white/20 bg-white/5 text-white/60" },
  scheduled: { label: "Agendada", cls: "border-cyan-400/50 bg-cyan-500/15 text-cyan-200" },
  running: { label: "Ativa", cls: "border-emerald-400/50 bg-emerald-500/15 text-emerald-200" },
  "pause-next-month": { label: "Pausa agendada", cls: "border-amber-400/50 bg-amber-500/15 text-amber-200" },
  paused: { label: "Pausada", cls: "border-amber-400/50 bg-amber-500/15 text-amber-200" },
};

type Props = {
  reserve: EmergencyReserve | null;
  progress: ReserveProgress | null;
  status: ReserveStatus | null;
  onConfigure: () => void;
  onToggle: (active: boolean) => void;
  onPause: () => void;
  onResume: () => void;
};

export default function ReserveCard({ reserve, progress, status, onConfigure, onToggle, onPause, onResume }: Props) {
  const badge = status ? STATUS_BADGE[status] : null;
  const openPause = reserve?.pauses.find((p) => p.to === null);

  return (
    <section
      className="rounded-2xl border border-emerald-400/30 bg-linear-to-br
                 from-[#06261f]/90 to-[#0a0430]/90 p-5 text-white
                 shadow-[0_0_30px_rgba(16,217,160,0.15)] backdrop-blur-md"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
                     bg-linear-to-br from-emerald-500 to-teal-600
                     shadow-[0_0_20px_rgba(16,217,160,0.45)]"
        >
          <ShieldCheck className="h-7 w-7" strokeWidth={1.5} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Reserva de Emergência</h2>
            {badge && (
              <span className={`rounded-full border px-2 py-0.5 text-[10px] ${badge.cls}`}>{badge.label}</span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-white/70">
            Sua proteção contra imprevistos. A meta é medida em meses das suas despesas fixas, com três
            marcos: 6 meses, 2 anos e 5 anos. Desativada, ela não entra nos cálculos.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {reserve && (
            <button
              type="button"
              role="switch"
              aria-checked={reserve.active}
              aria-label="Ativar reserva de emergência"
              onClick={() => onToggle(!reserve.active)}
              className={`relative h-6 w-11 rounded-full border transition-colors ${
                reserve.active ? "border-emerald-300 bg-emerald-500" : "border-white/25 bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-all ${
                  reserve.active ? "left-5.5" : "left-0.5"
                }`}
              />
            </button>
          )}
          <button
            type="button"
            onClick={onConfigure}
            className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r
                       from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold
                       shadow-[0_0_20px_rgba(16,217,160,0.35)] transition-opacity hover:opacity-90"
          >
            <Settings2 className="h-4 w-4" />
            {reserve ? "Editar Reserva" : "Configurar Reserva"}
          </button>
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        {!reserve || !progress || !status ? (
          <p className="py-2 text-center text-xs text-white/50">
            Nenhuma reserva configurada ainda. Clique em &quot;Configurar Reserva&quot; para começar.
          </p>
        ) : status === "inactive" ? (
          <p className="py-2 text-center text-xs text-white/55">
            Reserva desativada: ela não entra nos cálculos nem nas dicas. Ative-a no botão ao lado para
            voltar a considerá-la.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Marcos */}
            <div className="flex flex-wrap gap-2">
              {RESERVE_MILESTONES.map((m) => {
                const done = levelRank(m.level) <= levelRank(progress.achieved);
                const isNext = progress.next?.level === m.level;
                return (
                  <span
                    key={m.level}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] ${
                      done
                        ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-200"
                        : isNext
                          ? "border-white/40 bg-white/10 text-white"
                          : "border-white/15 text-white/45"
                    }`}
                  >
                    {done && <Check className="h-3 w-3" />}
                    {m.label}
                    {isNext && <span className="text-white/60">· próximo</span>}
                  </span>
                );
              })}
            </div>

            {/* Progresso até o próximo marco */}
            {progress.next ? (
              progress.nextAmount ? (
                <div>
                  <div className="flex items-end justify-between gap-3 text-xs">
                    <span className="text-white/70">
                      Rumo a <strong className="text-white">{progress.next.label}</strong> de despesas fixas
                    </span>
                    <span className="font-bold text-emerald-300">{progress.pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress.pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-white/55">
                    {formatBRL(progress.saved)} de {formatBRL(progress.nextAmount)}
                    {progress.monthsCovered !== null &&
                      ` · cobre ${progress.monthsCovered.toFixed(1).replace(".", ",")} meses hoje`}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-white/60">
                  Cadastre gastos fixos no Planejamento para a API calcular o valor de cada marco.
                </p>
              )
            ) : (
              <p className="text-xs text-emerald-300">Você concluiu todos os marcos da reserva. 🎉</p>
            )}

            {/* Situação e pausa */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-[11px] text-white/65">
              <span>
                Guardado hoje <strong className="text-white/90">{formatBRL(progress.saved)}</strong> · aporte{" "}
                <strong className="text-white/90">{formatBRL(reserve.monthly)}/mês</strong>
                {status === "scheduled" && <> · começa em {fmtMonth(reserve.startMonth)}</>}
                {status === "paused" && openPause && <> · pausada desde {fmtMonth(openPause.from)}</>}
                {status === "pause-next-month" && openPause && <> · pausa a partir de {fmtMonth(openPause.from)}</>}
              </span>

              {status === "running" && (
                <button
                  type="button"
                  onClick={onPause}
                  className="flex items-center gap-1.5 rounded-lg border border-white/25 px-3 py-1.5 font-medium
                             text-white transition-colors hover:bg-white/10"
                >
                  <Pause className="h-3.5 w-3.5" /> Pausar a partir do mês seguinte
                </button>
              )}
              {(status === "paused" || status === "pause-next-month") && (
                <button
                  type="button"
                  onClick={onResume}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500/90 px-3 py-1.5 font-semibold
                             text-white transition-opacity hover:opacity-90"
                >
                  <Play className="h-3.5 w-3.5" />
                  {status === "paused" ? "Retomar" : "Cancelar pausa"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
