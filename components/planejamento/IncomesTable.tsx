"use client";

import { CalendarDays, Pencil, Repeat, Trash2 } from "lucide-react";
import { formatBRL } from "@/lib/expenses";
import { periodLabel, type Income } from "@/lib/incomes";

type Props = {
  incomes: Income[];
  emptyText: string;
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
};

export default function IncomesTable({
  incomes,
  emptyText,
  onEdit,
  onDelete,
}: Props) {
  function handleDelete(i: Income) {
    if (window.confirm(`Apagar a renda "${i.name}"?`)) onDelete(i.id);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-purple-200 bg-white/90">
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-left text-xs">
          <thead className="bg-purple-50 text-[#4c3a9e]">
            <tr>
              <th className="px-3 py-1.5 font-medium">Nome da renda</th>
              <th className="px-3 py-1.5 font-medium">Proprietário</th>
              <th className="px-3 py-1.5 font-medium">Tipo</th>
              <th className="px-3 py-1.5 font-medium">Valor</th>
              <th className="px-3 py-1.5 font-medium">Período</th>
              <th className="px-3 py-1.5 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {incomes.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-[#4c3a9e]/70"
                >
                  {emptyText}
                </td>
              </tr>
            )}
            {incomes.map((i) => {
              const Icon = i.kind === "recurring" ? Repeat : CalendarDays;
              return (
                <tr
                  key={i.id}
                  className="border-t border-purple-100 text-[#2a1d78]"
                >
                  <td
                    className="px-3 py-2 font-medium"
                    title={i.notes || undefined}
                  >
                    {i.name}
                  </td>
                  <td className="px-3 py-2">{i.owner}</td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-[#6d4fd6]" />
                      {i.kind === "recurring" ? "Recorrente" : "Avulsa"}
                    </span>
                  </td>
                  <td className="px-3 py-2">{formatBRL(i.amount)}</td>
                  <td className="px-3 py-2">{periodLabel(i)}</td>
                  <td className="px-3 py-2">
                    <span className="flex justify-end gap-1">
                      <button
                        onClick={() => onEdit(i)}
                        aria-label={`Editar ${i.name}`}
                        className="rounded p-1 text-[#6d4fd6] hover:bg-purple-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(i)}
                        aria-label={`Apagar ${i.name}`}
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
  );
}