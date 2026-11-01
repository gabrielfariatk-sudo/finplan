"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { formatBRL, formatDate, parseMoney } from "@/lib/expenses";
import {
  parseOptionalMoney,
  parseRate,
  previewDebt,
  tomorrowIso,
  type DebtInput,
} from "@/lib/plans";
import {
  ConfirmStep,
  FieldError,
  GHOST_BUTTON,
  M_INPUT,
  M_LABEL,
  ModalShell,
  MoneyInput,
  primaryButton,
} from "./planUi";

type Props = {
  onClose: () => void;
  onConfirm: (plan: DebtInput) => void;
};

export default function DebtModal({ onClose, onConfirm }: Props) {
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [name, setName] = useState("");
  const [totalText, setTotalText] = useState("");
  const [paidText, setPaidText] = useState("");
  const [rateText, setRateText] = useState("");
  const [date, setDate] = useState("");

  const minDate = tomorrowIso();
  const total = parseMoney(totalText);
  const paid = parseOptionalMoney(paidText);
  const rate = parseRate(rateText);
  const dateOk = date !== "" && date >= minDate;
  const settled = total !== null && paid !== null && paid >= total;

  const valid =
    name.trim() !== "" &&
    total !== null &&
    paid !== null &&
    rate !== null &&
    !settled &&
    dateOk;

  const preview =
    valid && total !== null && paid !== null && rate !== null
      ? previewDebt(total, paid, rate, date)
      : null;

  function handleConfirm() {
    if (!preview || total === null || paid === null || rate === null) return;
    onConfirm({
      name: name.trim(),
      total,
      paid,
      endDate: date,
      ratePct: rate,
      monthly: preview.monthly,
      months: preview.months,
    });
    onClose();
  }

  return (
    <ModalShell
      title="Planejar Quitação"
      subtitle="Informe a dívida e a data para quitar. Calculamos a parcela mensal."
      icon={CircleCheck}
      accent="cyan"
      onClose={onClose}
    >
      {step === "confirm" &&
      preview &&
      total !== null &&
      paid !== null &&
      rate !== null ? (
        <ConfirmStep
          accent="cyan"
          preview={preview}
          intro={`Para quitar "${name.trim()}" até ${formatDate(date)}, você precisará pagar:`}
          rows={[
            ["Valor da dívida", formatBRL(total)],
            ["Já pago", formatBRL(paid)],
            ["Falta pagar", formatBRL(preview.remaining)],
            ...(rate > 0
              ? ([
                  ["Juros ao mês", `${String(rate).replace(".", ",")}%`],
                  ["Juros estimados", formatBRL(preview.interest)],
                ] as [string, string][])
              : []),
            ["Data para quitar", formatDate(date)],
          ]}
          note={
            rate > 0
              ? "Cálculo com parcelas fixas e juros compostos. O valor real pode variar conforme o contrato."
              : "Cálculo sem juros: o valor restante dividido pelos meses até a data."
          }
          confirmLabel="Confirmar e criar plano"
          onBack={() => setStep("form")}
          onConfirm={handleConfirm}
        />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) setStep("confirm");
          }}
          className="space-y-3"
        >
          <div>
            <label htmlFor="db-name" className={M_LABEL}>
              Nome da dívida
            </label>
            <input
              id="db-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              autoFocus
              placeholder="Ex: Cartão de crédito, Financiamento..."
              className={M_INPUT}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="db-total" className={M_LABEL}>
                Valor total da dívida
              </label>
              <MoneyInput
                id="db-total"
                value={totalText}
                onChange={setTotalText}
                placeholder="Ex: 3.000,00"
              />
            </div>
            <div>
              <label htmlFor="db-paid" className={M_LABEL}>
                Já pago <span className="font-normal text-white/50">(opcional)</span>
              </label>
              <MoneyInput
                id="db-paid"
                value={paidText}
                onChange={setPaidText}
                placeholder="Ex: 500,00"
              />
            </div>
          </div>
          {settled && <FieldError>O valor pago já quita a dívida.</FieldError>}
          {paid === null && (
            <FieldError>Informe um valor válido em &quot;Já pago&quot;.</FieldError>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="db-date" className={M_LABEL}>
                Data para quitar
              </label>
              <input
                id="db-date"
                type="date"
                value={date}
                min={minDate}
                onChange={(e) => setDate(e.target.value)}
                className={M_INPUT}
              />
              {date !== "" && !dateOk && (
                <FieldError>Escolha uma data futura.</FieldError>
              )}
            </div>
            <div>
              <label htmlFor="db-rate" className={M_LABEL}>
                Juros ao mês <span className="font-normal text-white/50">(opcional)</span>
              </label>
              <div className="relative">
                <input
                  id="db-rate"
                  value={rateText}
                  onChange={(e) => setRateText(e.target.value)}
                  inputMode="decimal"
                  placeholder="Ex: 2,5"
                  className={`${M_INPUT} pr-8`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/60">
                  %
                </span>
              </div>
              {rate === null && <FieldError>Informe um valor entre 0 e 100.</FieldError>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={GHOST_BUTTON}>
              Cancelar
            </button>
            <button type="submit" disabled={!valid} className={primaryButton("cyan")}>
              Calcular valor mensal
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}