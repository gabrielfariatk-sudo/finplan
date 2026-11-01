"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { amountToInput, formatBRL } from "@/lib/expenses";
import { parseOptionalMoney } from "@/lib/plans";
import {
  LEVEL_OPTIONS,
  levelMonths,
  maxLevel,
  reserveSavedNow,
  type EmergencyReserve,
  type ReserveInput,
  type ReserveLevel,
} from "@/lib/reserve";
import { monthKey } from "@/lib/calcConfig";
import { FieldError, GHOST_BUTTON, M_INPUT, M_LABEL, ModalShell, MoneyInput, primaryButton } from "./planUi";

type Props = {
  initial: EmergencyReserve | null; // null = criando
  fixedMonthly: number; // despesas fixas do mês (base da meta)
  suggestedMonthly: number; // regra de investimento aplicada à renda base
  investPct: number;
  onClose: () => void;
  onSave: (input: ReserveInput) => void;
};

const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

// Os próximos 24 meses, começando no atual: [{ value: "2026-11", label: "novembro de 2026" }]
function monthOptions(now = new Date()) {
  return Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { value: monthKey(d), label: `${MONTH_NAMES[d.getMonth()]} de ${d.getFullYear()}` };
  });
}

export default function ReserveModal({ initial, fixedMonthly, suggestedMonthly, investPct, onClose, onSave }: Props) {
  const now = new Date();
  const nowKey = monthKey(now);
  const months = useMemo(() => monthOptions(now), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [active, setActive] = useState(initial?.active ?? true);
  const [have, setHave] = useState<ReserveLevel>(initial?.have ?? "none");
  const [savedText, setSavedText] = useState(initial ? amountToInput(reserveSavedNow(initial, nowKey)) : "");
  const [monthlyText, setMonthlyText] = useState(initial ? amountToInput(initial.monthly) : "");
  const [start, setStart] = useState(initial && initial.startMonth > nowKey ? initial.startMonth : nowKey);

  const saved = parseOptionalMoney(savedText);
  const monthly = parseOptionalMoney(monthlyText);
  const valid = saved !== null && monthly !== null;

  const levelAmount = fixedMonthly > 0 && have !== "none" ? Math.round(levelMonths(have) * fixedMonthly * 100) / 100 : 0;

  function handleSave() {
    if (!valid || saved === null || monthly === null) return;
    onSave({
      active,
      have,
      baseSaved: saved,
      startMonth: start,
      monthly,
      // as pausas que já terminaram antes do novo início deixam de importar
      pauses: (initial?.pauses ?? []).filter((p) => p.to === null || p.to >= start),
      dismissed: maxLevel(initial?.dismissed ?? "none", have),
    });
    onClose();
  }

  return (
    <ModalShell
      title={initial ? "Editar Reserva de Emergência" : "Configurar Reserva de Emergência"}
      subtitle="Conte como está a sua reserva e quando quer começar ou continuar os aportes."
      icon={ShieldCheck}
      accent="emerald"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-4"
      >
        {/* Ativar */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-3">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-emerald-500"
          />
          <span>
            <span className="block text-xs font-semibold">Ativar a reserva de emergência</span>
            <span className="block text-[11px] text-white/60">
              Desativada, ela não entra nos cálculos nem nas dicas da API.
            </span>
          </span>
        </label>

        {/* O que já possui */}
        <div>
          <p className={M_LABEL}>Você já possui reserva para quanto tempo?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Reserva que você já possui">
            {LEVEL_OPTIONS.map((o) => (
              <button
                key={o.level}
                type="button"
                role="radio"
                aria-checked={have === o.level}
                onClick={() => setHave(o.level)}
                className={`rounded-lg border px-2 py-2 text-xs transition-colors ${
                  have === o.level
                    ? "border-emerald-300 bg-emerald-500/25 font-semibold text-white"
                    : "border-white/20 bg-white/5 text-white/75 hover:bg-white/10"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-white/50">
            Contamos em meses das suas despesas fixas
            {fixedMonthly > 0 ? ` (hoje ${formatBRL(fixedMonthly)}/mês).` : ". Cadastre gastos fixos no Planejamento para a API calcular os valores."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="rv-saved" className={M_LABEL}>
              Valor que você tem guardado hoje
            </label>
            <MoneyInput id="rv-saved" value={savedText} onChange={setSavedText} placeholder="Ex: 12.000,00" />
            {levelAmount > 0 && (
              <button
                type="button"
                onClick={() => setSavedText(amountToInput(levelAmount))}
                className="mt-1 text-left text-[11px] text-emerald-300 hover:underline"
              >
                Usar {formatBRL(levelAmount)} ({levelMonths(have)} meses de despesas fixas)
              </button>
            )}
            {saved === null && <FieldError>Informe um valor válido.</FieldError>}
          </div>

          <div>
            <label htmlFor="rv-monthly" className={M_LABEL}>
              Aporte mensal
            </label>
            <MoneyInput id="rv-monthly" value={monthlyText} onChange={setMonthlyText} placeholder="Ex: 500,00" />
            {suggestedMonthly > 0 && (
              <button
                type="button"
                onClick={() => setMonthlyText(amountToInput(suggestedMonthly))}
                className="mt-1 text-left text-[11px] text-emerald-300 hover:underline"
              >
                Sugestão: {formatBRL(suggestedMonthly)} ({investPct}% da sua renda base)
              </button>
            )}
            {monthly === null && <FieldError>Informe um valor válido.</FieldError>}
          </div>
        </div>

        <div>
          <label htmlFor="rv-start" className={M_LABEL}>
            Quando deseja iniciar ou continuar os aportes?
          </label>
          <select id="rv-start" value={start} onChange={(e) => setStart(e.target.value)} className={M_INPUT}>
            {months.map((m) => (
              <option key={m.value} value={m.value} className="text-black">
                {m.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-white/50">
            Cada aporte entra no valor guardado quando o mês termina. Você pode pausar e retomar a qualquer
            momento no cartão da reserva.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={GHOST_BUTTON}>
            Cancelar
          </button>
          <button type="submit" disabled={!valid} className={primaryButton("emerald")}>
            Salvar reserva
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
