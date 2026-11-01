"use client";

import { useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ICONS, type Category } from "@/lib/categories";
import {
  amountToInput,
  formatBRL,
  formatDate,
  parseMoney,
  type VariableExpense,
} from "@/lib/expenses";
import CategorySelect from "./CategorySelect";
import InfoNotice from "./InfoNotice";
import {
  CARD_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "./formStyles";

export type VariableInput = Omit<VariableExpense, "id">;

type Props = {
  categories: Category[];
  expenses: VariableExpense[]; // já filtrados pelo mês/ano selecionados
  year: number;
  month: number; // 0-11
  onCreate: (data: VariableInput) => void;
  onUpdate: (id: string, data: VariableInput) => void;
  onDelete: (id: string) => void;
};

// Data inicial do campo: hoje, se estiver no mês filtrado; senão dia 1 dele
function defaultDate(year: number, month: number) {
  const now = new Date();
  const day =
    now.getFullYear() === year && now.getMonth() === month ? now.getDate() : 1;
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function VariableExpensesCard({
  categories,
  expenses,
  year,
  month,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amountText, setAmountText] = useState("");
  const [date, setDate] = useState(() => defaultDate(year, month));

  const amount = parseMoney(amountText);
  const valid =
    name.trim() !== "" && categoryId !== "" && amount !== null && date !== "";

  function reset() {
    setEditingId(null);
    setName("");
    setCategoryId("");
    setAmountText("");
    setDate(defaultDate(year, month));
  }

  function handleSubmit() {
    if (!valid || amount === null) return;
    const data: VariableInput = { name: name.trim(), categoryId, amount, date };
    if (editingId) onUpdate(editingId, data);
    else onCreate(data);
    reset();
  }

  function startEdit(e: VariableExpense) {
    setEditingId(e.id);
    setName(e.name);
    setCategoryId(e.categoryId);
    setAmountText(amountToInput(e.amount));
    setDate(e.date);
  }

  function handleDelete(e: VariableExpense) {
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
          <h2 className="text-sm font-semibold text-[#2a1d78]">
            Gastos Variáveis
          </h2>
          <p className="text-[10px] leading-snug text-[#4c3a9e]/80">
            São aqueles que podem mudar de valor e devem ser inseridos
            manualmente.
          </p>
        </div>
      </div>

      {/* Aviso */}
      <InfoNotice>
        Os gastos variáveis devem ser cadastrados mensalmente, sem
        reaproveitamento automático para os próximos períodos.
      </InfoNotice>

      {/* Formulário */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="vr-name" className={LABEL_CLASS}>
            Nome do gasto
          </label>
          <input
            id="vr-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Ex: Supermercado, Lazer, Combustível..."
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
          <label htmlFor="vr-amount" className={LABEL_CLASS}>
            Valor (R$)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#4c3a9e]">
              R$
            </span>
            <input
              id="vr-amount"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              inputMode="decimal"
              placeholder="Ex: 200,00"
              className={`${INPUT_CLASS} pl-8`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="vr-date" className={LABEL_CLASS}>
            Data do gasto
          </label>
          <input
            id="vr-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${INPUT_CLASS} scheme-light`}
          />
        </div>
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
            Gastos Variáveis Cadastrados
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-120 text-left text-xs">
            <thead className="bg-purple-50 text-[#4c3a9e]">
              <tr>
                <th className="px-3 py-1.5 font-medium">Nome</th>
                <th className="px-3 py-1.5 font-medium">Categoria</th>
                <th className="px-3 py-1.5 font-medium">Valor</th>
                <th className="px-3 py-1.5 font-medium">Data</th>
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
                    Nenhum gasto variável neste período.
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
                    <td className="px-3 py-2">{formatDate(e.date)}</td>
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