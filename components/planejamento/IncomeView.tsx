"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Clock, Wallet } from "lucide-react";
import {
  currentMonthValue,
  isEnded,
  type Income,
  type IncomeInput,
} from "@/lib/incomes";
import IncomeFormCard from "./IncomeFormCard";
import IncomesTable from "./IncomesTable";
import { CARD_CLASS } from "./formStyles";
import DataNotice from "@/components/DataNotice";
import { useUserData } from "@/lib/useUserData";

function countLabel(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`;
}

export default function IncomeView() {
  // Rendas salvas no banco local do usuário
  const incomesDb = useUserData<Income>("rendas");
  const incomes = incomesDb.items;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEnded, setShowEnded] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const current = currentMonthValue();
  const active = incomes.filter((i) => !isEnded(i, current));
  const ended = incomes.filter((i) => isEnded(i, current));
  const editing = incomes.find((i) => i.id === editingId) ?? null;

  function save(data: IncomeInput) {
    if (editing) incomesDb.update(editing.id, data);
    else incomesDb.create(data);
    setEditingId(null);
  }

  function remove(id: string) {
    incomesDb.remove(id);
    if (editingId === id) setEditingId(null);
  }

  function startEdit(income: Income) {
    setEditingId(income.id);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col gap-3">
      <DataNotice loading={incomesDb.loading} error={incomesDb.error} />

      {/* Voltar */}
      <div>
        <Link
          href="/planejamento"
          aria-label="Voltar para Planejamento"
          className="inline-flex items-center gap-1.5 rounded-lg border
                     border-purple-300/60 bg-white/75 px-3 py-1.5 text-xs
                     font-medium text-[#2a1d78] backdrop-blur-md
                     shadow-[0_4px_14px_rgba(91,63,191,0.18)]
                     transition-colors hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4 text-[#6d4fd6]" />
          Voltar
        </Link>
      </div>

      {/* Formulário */}
      <div ref={formRef} className="scroll-mt-4">
        <IncomeFormCard
          key={editing?.id ?? "new"}
          editing={editing}
          onSubmit={save}
          onCancel={() => setEditingId(null)}
        />
      </div>

      {/* Rendas ativas */}
      <section className={CARD_CLASS}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-[#6d4fd6]">
              <Wallet className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[#2a1d78]">
                Rendas Ativas
              </h2>
              <p className="text-[10px] text-[#4c3a9e]/80">
                {countLabel(
                  active.length,
                  "renda cadastrada",
                  "rendas cadastradas",
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowEnded((v) => !v)}
            aria-pressed={showEnded}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5
                        text-xs font-medium text-[#2a1d78] transition-colors ${
                          showEnded
                            ? "border-purple-500 bg-purple-100"
                            : "border-purple-300/60 bg-white/75 hover:bg-white"
                        }`}
          >
            <Clock className="h-3.5 w-3.5 text-[#6d4fd6]" />
            Ver encerradas
          </button>
        </div>

        <IncomesTable
          incomes={active}
          emptyText="Nenhuma renda ativa cadastrada."
          onEdit={startEdit}
          onDelete={remove}
        />
      </section>

      {/* Rendas encerradas (recolhível) */}
      <section className={CARD_CLASS}>
        <button
          onClick={() => setShowEnded((v) => !v)}
          aria-expanded={showEnded}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-[#6d4fd6]">
              <Clock className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-[#2a1d78]">
                Rendas Encerradas
              </span>
              <span className="block text-[10px] text-[#4c3a9e]/80">
                {countLabel(ended.length, "renda", "rendas")}
              </span>
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[#4c3a9e] transition-transform duration-200 ${
              showEnded ? "rotate-180" : ""
            }`}
          />
        </button>

        {showEnded && (
          <div className="mt-3">
            <IncomesTable
              incomes={ended}
              emptyText="Nenhuma renda encerrada."
              onEdit={startEdit}
              onDelete={remove}
            />
          </div>
        )}
      </section>
    </div>
  );
}