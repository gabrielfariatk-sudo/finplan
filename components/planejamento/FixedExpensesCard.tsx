"use client";

import { useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  Lightbulb,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ICONS, type Category } from "@/lib/categories";
import {
  DURATIONS,
  amountToInput,
  durationLabel,
  formatBRL,
  parseMoney,
  type FixedExpense,
} from "@/lib/expenses";
import CategorySelect from "./CategorySelect";
import InfoNotice from "./InfoNotice";
import {
  CARD_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "./formStyles";

export type FixedInput = Pick<
  FixedExpense,
  "name" | "categoryId" | "amount" | "duration"
>;

type Props = {
  categories: Category[];
  expenses: FixedExpense[]; // já filtrados pelo mês/ano selecionados
  onCreate: (data: FixedInput) => void;
  onUpdate: (id: string, data: FixedInput) => void;
  onDelete: (id: string) => void;
};

export default function FixedExpensesCard({
  categories,
  expenses,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amountText, setAmountText] = useState("");
  const [duration, setDuration] = useState<number | null>(12);

  const amount = parseMoney(amountText);
  const valid = name.trim() !== "" && categoryId !== "" && amount !== null;

  function reset() {
    setEditingId(null);
    setName("");
    setCategoryId("");
    setAmountText("");
    setDuration(12);
  }

  function handleSubmit() {
    if (!valid || amount === null) return;
    const data: FixedInput = { name: name.trim(), categoryId, amount, duration };
    if (editingId) onUpdate(editingId, data);
    else onCreate(data);
    reset();
  }

  function startEdit(e: FixedExpense) {
    setEditingId(e.id);
    setName(e.name);
    setCategoryId(e.categoryId);
    setAmountText(amountToInput(e.amount));
    setDuration(e.duration);
  }

  function handleDelete(e: FixedExpense) {
    if (window.confirm(`Apagar o gasto "${e.name}"?`)) {
      onDelete(e.id);
      if (editingId === e.id) reset();
    }
  }

  return (
    <section className={CARD_CLASS}>
      {/* Cabeçalho */}
      <div className="mb-3 flex items-start gap-2">
        <CalendarClock
          className="mt-0.5 h-5 w-5 text-[#6d4fd6]"
          strokeWidth={1.5}
        />
        <div>
          <h2 className="text-sm font-semibold text-[#2a1d78]">Gastos Fixos</h2>
          <p className="text-[10px] leading-snug text-[#4c3a9e]/80">
            São aqueles que não mudam de valor durante o período determinado.
          </p>
        </div>
      </div>

      {/* Aviso */}
      <InfoNotice>
        O gasto fixo adicionado será reaproveitado para o cálculo durante o
        período de duração selecionado.
      </InfoNotice>

      {/* Formulário */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="fx-name" className={LABEL_CLASS}>
            Nome do gasto
          </label>
          <input
            id="fx-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Ex: Aluguel, Internet, Academia..."
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <span className={LABEL_CLASS}>Categoria</span>
          <CategorySelect
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
          />
        </div>

        <div>
          <label htmlFor="fx-amount" className={LABEL_CLASS}>
            Valor (R$)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#4c3a9e]">
              R$
            </span>
            <input
              id="fx-amount"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              inputMode="decimal"
              placeholder="Ex: 500,00"
              className={`${INPUT_CLASS} pl-8`}
            />
          </div>

          {/* Instrução de preenchimento */}
          <p className="mt-1.5 flex items-start gap-1.5 text-[10px] leading-snug text-[#4c3a9e]">
            <Lightbulb className="mt-px h-3 w-3 shrink-0 text-[#6d4fd6]" />
            <span>
              Compra parcelada no cartão de crédito? Informe o{" "}
              <strong className="font-semibold text-[#2a1d78]">
                valor de cada parcela
              </strong>{" "}
              e escolha em{" "}
              <strong className="font-semibold text-[#2a1d78]">Duração</strong>{" "}
              o número de parcelas.
            </span>
          </p>
        </div>

        <fieldset>
          <legend className={LABEL_CLASS}>Duração</legend>
          <div className="grid grid-cols-3 gap-x-2 gap-y-1 sm:grid-cols-4">
            {DURATIONS.map((d) => (
              <label
                key={d}
                className="flex cursor-pointer items-center gap-1 text-[11px] text-[#2a1d78]"
              >
                <input
                  type="radio"
                  name="fx-duration"
                  checked={duration === d}
                  onChange={() => setDuration(d)}
                  className="h-3 w-3 accent-purple-600"
                />
                {d} {d === 1 ? "mês" : "meses"}
              </label>
            ))}
            <label className="col-span-full flex cursor-pointer items-center gap-1 text-[11px] text-[#2a1d78]">
              <input
                type="radio"
                name="fx-duration"
                checked={duration === null}
                onChange={() => setDuration(null)}
                className="h-3 w-3 accent-purple-600"
              />
              Prazo indeterminado
            </label>
          </div>
        </fieldset>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!valid}
          className={`${PRIMARY_BUTTON_CLASS} min-w-32`}
        >
          {editingId ? (
            "Salvar alterações"
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </>
          )}
        </button>
        {editingId && (
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs
                       text-[#4c3a9e] hover:bg-purple-100"
          >
            <X className="h-3.5 w-3.5" /> Cancelar
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="mt-4 overflow-hidden rounded-lg border border-purple-200 bg-white/90">
        <div className="flex items-center gap-2 border-b border-purple-200 px-3 py-2">
          <CalendarDays className="h-4 w-4 text-[#6d4fd6]" strokeWidth={1.5} />
          <h3 className="text-xs font-semibold text-[#2a1d78]">
            Gastos Fixos Cadastrados
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-120 text-left text-xs">
            <thead className="bg-purple-50 text-[#4c3a9e]">
              <tr>
                <th className="px-3 py-1.5 font-medium">Nome</th>
                <th className="px-3 py-1.5 font-medium">Categoria</th>
                <th className="px-3 py-1.5 font-medium">Valor</th>
                <th className="px-3 py-1.5 font-medium">Duração</th>
                <th className="px-3 py-1.5 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-[#4c3a9e]/70"
                  >
                    Nenhum gasto fixo neste período.
                  </td>
                </tr>
              )}
              {expenses.map((e) => {
                const cat = categories.find((c) => c.id === e.categoryId);
                const Icon = cat ? (ICONS[cat.icon] ?? ICONS.ellipsis) : null;
                return (
                  <tr
                    key={e.id}
                    className="border-t border-purple-100 text-[#2a1d78]"
                  >
                    <td className="px-3 py-2 font-medium">{e.name}</td>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-1.5">
                        {cat && Icon && (
                          <span
                            className="flex h-4 w-4 items-center justify-center rounded"
                            style={{ backgroundColor: cat.color }}
                          >
                            <Icon className="h-2.5 w-2.5 text-white" />
                          </span>
                        )}
                        {cat?.name ?? "Sem categoria"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{formatBRL(e.amount)}</td>
                    <td className="px-3 py-2">{durationLabel(e.duration)}</td>
                    <td className="px-3 py-2">
                      <span className="flex justify-end gap-1">
                        <button
                          onClick={() => startEdit(e)}
                          aria-label={`Editar ${e.name}`}
                          className="rounded p-1 text-[#6d4fd6] hover:bg-purple-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(e)}
                          aria-label={`Apagar ${e.name}`}
                          className="rounded p-1 text-rose-500 hover:bg-rose-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}