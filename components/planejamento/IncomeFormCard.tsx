"use client";

import { useState } from "react";
import {
  CalendarDays,
  FileText,
  Plus,
  Repeat,
  User,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { amountToInput, parseMoney } from "@/lib/expenses";
import {
  currentMonthValue,
  type Income,
  type IncomeInput,
  type IncomeKind,
} from "@/lib/incomes";
import MonthYearPicker from "./MonthYearPicker";
import {
  CARD_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "./formStyles";

const KINDS: { value: IncomeKind; label: string; icon: LucideIcon }[] = [
  { value: "recurring", label: "Recorrente", icon: Repeat },
  { value: "one-off", label: "Avulsa", icon: CalendarDays },
];

const MAX_NOTES = 500;

type Props = {
  editing: Income | null; // null = criando
  onSubmit: (data: IncomeInput) => void;
  onCancel: () => void;
};

export default function IncomeFormCard({ editing, onSubmit, onCancel }: Props) {
  const [kind, setKind] = useState<IncomeKind>(editing?.kind ?? "recurring");
  const [owner, setOwner] = useState(editing?.owner ?? "");
  const [name, setName] = useState(editing?.name ?? "");
  const [amountText, setAmountText] = useState(
    editing ? amountToInput(editing.amount) : "",
  );
  const [start, setStart] = useState(editing?.start ?? "");
  const [end, setEnd] = useState(editing?.end ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");

  const amount = parseMoney(amountText);
  const rangeError =
    kind === "recurring" && start !== "" && end !== "" && end < start;
  const valid =
    owner.trim() !== "" && name.trim() !== "" && amount !== null && !rangeError;

  function reset() {
    setKind("recurring");
    setOwner("");
    setName("");
    setAmountText("");
    setStart("");
    setEnd("");
    setNotes("");
  }

  function changeKind(value: IncomeKind) {
    setKind(value);
    if (value === "one-off") setEnd("");
  }

  function handleSubmit() {
    if (!valid || amount === null) return;
    onSubmit({
      kind,
      owner: owner.trim(),
      name: name.trim(),
      amount,
      // Avulsa sem mês informado usa o mês atual
      start: kind === "one-off" ? start || currentMonthValue() : start || null,
      end: kind === "one-off" ? null : end || null,
      notes: notes.trim(),
    });
    if (!editing) reset();
  }

  const optional = (
    <span className="font-normal text-[#4c3a9e]/70"> (opcional)</span>
  );
  const required = <span className="text-rose-500"> *</span>;

  return (
    <section className={CARD_CLASS}>
      {/* Cabeçalho */}
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-[#6d4fd6]">
          <Wallet className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <h2 className="text-sm font-semibold text-[#2a1d78]">
          {editing ? "Editar Renda" : "Dados da Renda"}
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Tipo */}
        <div>
          <span className={LABEL_CLASS}>Tipo de renda{required}</span>
          <div
            role="radiogroup"
            aria-label="Tipo de renda"
            className="grid grid-cols-2 gap-1 rounded-md border border-purple-200 bg-white p-0.5"
          >
            {KINDS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={kind === value}
                onClick={() => changeKind(value)}
                className={`flex items-center justify-center gap-1.5 rounded px-3 py-1
                            text-xs font-medium transition-colors ${
                              kind === value
                                ? "bg-linear-to-r from-purple-600 to-violet-600 text-white shadow-[0_3px_10px_rgba(109,40,217,0.35)]"
                                : "text-[#4c3a9e] hover:bg-purple-50"
                            }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Proprietário */}
        <div>
          <label htmlFor="in-owner" className={LABEL_CLASS}>
            Proprietário da renda{required}
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6d4fd6]" />
            <input
              id="in-owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              maxLength={40}
              placeholder="Digite o nome do proprietário..."
              className={`${INPUT_CLASS} pl-8`}
            />
          </div>
        </div>

        {/* Nome */}
        <div>
          <label htmlFor="in-name" className={LABEL_CLASS}>
            Nome da renda{required}
          </label>
          <div className="relative">
            <FileText className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6d4fd6]" />
            <input
              id="in-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Ex.: Salário, Freelance, Aluguel..."
              className={`${INPUT_CLASS} pl-8`}
            />
          </div>
        </div>

        {/* Valor */}
        <div>
          <label htmlFor="in-amount" className={LABEL_CLASS}>
            Valor (R$){required}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#4c3a9e]">
              R$
            </span>
            <input
              id="in-amount"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              inputMode="decimal"
              placeholder="Ex.: 2.500,00"
              className={`${INPUT_CLASS} pl-8`}
            />
          </div>
        </div>

        {/* Início (ou mês de recebimento, na avulsa) */}
        <div>
          <label htmlFor="in-start" className={LABEL_CLASS}>
            {kind === "recurring" ? "Data de início" : "Mês de recebimento"}
            {optional}
          </label>
          <MonthYearPicker id="in-start" value={start} onChange={setStart} />
          {kind === "one-off" && (
            <p className="mt-1 text-[10px] text-[#4c3a9e]/80">
              Se não informar, usamos o mês atual.
            </p>
          )}
        </div>

        {/* Término (só recorrente) */}
        {kind === "recurring" && (
          <div>
            <label htmlFor="in-end" className={LABEL_CLASS}>
              Data de término{optional}
            </label>
            <MonthYearPicker id="in-end" value={end} onChange={setEnd} />
            {rangeError && (
              <p className="mt-1 text-[10px] font-medium text-rose-600">
                O término deve ser igual ou posterior ao início.
              </p>
            )}
          </div>
        )}

        {/* Observações */}
        <div className="md:col-span-2">
          <label htmlFor="in-notes" className={LABEL_CLASS}>
            Observações{optional}
          </label>
          <textarea
            id="in-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={MAX_NOTES}
            rows={3}
            placeholder="Digite alguma observação..."
            className={`${INPUT_CLASS} resize-none`}
          />
          <p className="mt-0.5 text-right text-[10px] text-[#4c3a9e]/70">
            {notes.length}/{MAX_NOTES}
          </p>
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!valid}
          className={`${PRIMARY_BUTTON_CLASS} flex-1 py-2`}
        >
          {editing ? (
            "Salvar alterações"
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Adicionar Renda
            </>
          )}
        </button>
        {editing && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs
                       text-[#4c3a9e] hover:bg-purple-100"
          >
            <X className="h-3.5 w-3.5" /> Cancelar
          </button>
        )}
      </div>
    </section>
  );
}