"use client";

import { useState } from "react";
import { PiggyBank } from "lucide-react";
import { formatBRL, formatDate, parseMoney } from "@/lib/expenses";
import {
  parseOptionalMoney,
  previewSavings,
  tomorrowIso,
  type SavingsInput,
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
  onConfirm: (plan: SavingsInput) => void;
};

export default function SavingsModal({ onClose, onConfirm }: Props) {
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [name, setName] = useState("");
  const [targetText, setTargetText] = useState("");
  const [savedText, setSavedText] = useState("");
  const [date, setDate] = useState("");

  const minDate = tomorrowIso();
  const target = parseMoney(targetText);
  const saved = parseOptionalMoney(savedText);
  const dateOk = date !== "" && date >= minDate;
  const reached = target !== null && saved !== null && saved >= target;

  const valid =
    name.trim() !== "" &&
    target !== null &&
    saved !== null &&
    !reached &&
    dateOk;

  const preview =
    valid && target !== null && saved !== null
      ? previewSavings(target, saved, date)
      : null;

  function handleConfirm() {
    if (!preview || target === null || saved === null) return;
    onConfirm({
      name: name.trim(),
      target,
      saved,
      targetDate: date,
      monthly: preview.monthly,
      months: preview.months,
    });
    onClose();
  }

  return (
    <ModalShell
      title="Registrar Caixinha"
      subtitle="Informe a meta e a data. Calculamos quanto você precisa guardar por mês."
      icon={PiggyBank}
      accent="purple"
      onClose={onClose}
    >
      {step === "confirm" && preview && target !== null && saved !== null ? (
        <ConfirmStep
          accent="purple"
          preview={preview}
          intro={`Para alcançar "${name.trim()}" até ${formatDate(date)}, você precisará guardar:`}
          rows={[
            ["Meta", formatBRL(target)],
            ["Já guardado", formatBRL(saved)],
            ["Falta guardar", formatBRL(preview.remaining)],
            ["Data do evento / resgate", formatDate(date)],
          ]}
          note="Ao confirmar, a caixinha será criada e aparecerá na sua lista."
          confirmLabel="Confirmar e criar caixinha"
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
            <label htmlFor="sv-name" className={M_LABEL}>
              Nome da caixinha
            </label>
            <input
              id="sv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              autoFocus
              placeholder="Ex: Viagem de fim de ano, Reserva de emergência..."
              className={M_INPUT}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="sv-target" className={M_LABEL}>
                Valor da meta
              </label>
              <MoneyInput
                id="sv-target"
                value={targetText}
                onChange={setTargetText}
                placeholder="Ex: 5.000,00"
              />
            </div>
            <div>
              <label htmlFor="sv-saved" className={M_LABEL}>
                Já guardado <span className="font-normal text-white/50">(opcional)</span>
              </label>
              <MoneyInput
                id="sv-saved"
                value={savedText}
                onChange={setSavedText}
                placeholder="Ex: 800,00"
              />
            </div>
          </div>
          {reached && (
            <FieldError>O valor guardado já atinge a meta.</FieldError>
          )}
          {saved === null && (
            <FieldError>Informe um valor válido em &quot;Já guardado&quot;.</FieldError>
          )}

          <div>
            <label htmlFor="sv-date" className={M_LABEL}>
              Data do evento ou do resgate
            </label>
            <input
              id="sv-date"
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

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={GHOST_BUTTON}>
              Cancelar
            </button>
            <button type="submit" disabled={!valid} className={primaryButton("purple")}>
              Calcular valor mensal
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}