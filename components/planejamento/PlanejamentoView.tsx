"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, DollarSign, Tag } from "lucide-react";
import CategoriesCard from "./CategoriesCard";
import type { CategoryInput } from "./CategoryModal";
import FilterDropdown from "./FilterDropdown";
import FixedExpensesCard, { type FixedInput } from "./FixedExpensesCard";
import VariableExpensesCard, { type VariableInput } from "./VariableExpensesCard";
import type { Category } from "@/lib/categories";
import DataNotice from "@/components/DataNotice";
import { useUserData } from "@/lib/useUserData";
import {
  isFixedActive,
  periodIndex,
  type FixedExpense,
  type VariableExpense,
} from "@/lib/expenses";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const MONTH_OPTIONS = MONTHS.map((label, value) => ({ value, label }));

export default function PlanejamentoView() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [showCategories, setShowCategories] = useState(true);

  // Tudo é salvo no banco local do usuário (/api/data/...)
  const categoriesDb = useUserData<Category>("categorias");
  const fixedDb = useUserData<FixedExpense>("gastos-fixos");
  const variableDb = useUserData<VariableExpense>("gastos-variaveis");
  const categories = categoriesDb.items;
  const fixed = fixedDb.items;
  const variable = variableDb.items;

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = now.getFullYear() - 2 + i;
    return { value: y, label: String(y) };
  });

  // Filtra pelo mês/ano selecionados
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const visibleFixed = fixed.filter((e) => isFixedActive(e, year, month));
  const visibleVariable = variable
    .filter((e) => e.date.startsWith(monthPrefix))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ---- Categorias ----
  function createCategory(data: CategoryInput) {
    categoriesDb.create(data);
  }
  function updateCategory(id: string, data: CategoryInput) {
    categoriesDb.update(id, data);
  }
  function deleteCategory(id: string) {
    categoriesDb.remove(id);
  }

  // ---- Gastos fixos ----
  function createFixed(data: FixedInput) {
    fixedDb.create({ startIndex: periodIndex(year, month), ...data });
  }
  function updateFixed(id: string, data: FixedInput) {
    fixedDb.update(id, data);
  }
  function deleteFixed(id: string) {
    fixedDb.remove(id);
  }

  // ---- Gastos variáveis ----
  function createVariable(data: VariableInput) {
    variableDb.create(data);
  }
  function updateVariable(id: string, data: VariableInput) {
    variableDb.update(id, data);
  }
  function deleteVariable(id: string) {
    variableDb.remove(id);
  }

  return (
    <div className="flex flex-col gap-3">
      <DataNotice
        loading={categoriesDb.loading || fixedDb.loading || variableDb.loading}
        error={categoriesDb.error ?? fixedDb.error ?? variableDb.error}
      />

      {/* Barra de filtros e ações */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          icon={
            <CalendarDays className="h-4 w-4 text-[#6d4fd6]" strokeWidth={1.5} />
          }
          label="Mês"
          value={month}
          options={MONTH_OPTIONS}
          onChange={setMonth}
          columns={2}
        />

        <FilterDropdown
          label="Ano"
          value={year}
          options={yearOptions}
          onChange={setYear}
        />

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/planejamento/renda"
            className="flex items-center gap-1.5 rounded-lg
                       bg-linear-to-r from-purple-600 to-violet-600 px-3 py-1.5
                       text-xs font-medium text-white
                       shadow-[0_4px_14px_rgba(109,40,217,0.4)]
                       transition-opacity hover:opacity-90"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/30">
              <DollarSign className="h-3 w-3" />
            </span>
            Inserir Renda
          </Link>

          <button
            onClick={() => setShowCategories((v) => !v)}
            aria-pressed={showCategories}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5
                        text-xs font-medium backdrop-blur-md transition-colors
                        shadow-[0_4px_14px_rgba(91,63,191,0.18)] ${
                          showCategories
                            ? "border-purple-500 bg-purple-100 text-[#2a1d78]"
                            : "border-purple-300/60 bg-white/75 text-[#2a1d78] hover:bg-white"
                        }`}
          >
            <Tag className="h-3.5 w-3.5 text-[#6d4fd6]" />
            Categorias
          </button>
        </div>
      </div>

      {showCategories && (
        <CategoriesCard
          categories={categories}
          onCreate={createCategory}
          onUpdate={updateCategory}
          onDelete={deleteCategory}
        />
      )}

      {/* Gastos fixos e variáveis lado a lado */}
      <div className="grid items-start gap-3 lg:grid-cols-2">
        <FixedExpensesCard
          categories={categories}
          expenses={visibleFixed}
          onCreate={createFixed}
          onUpdate={updateFixed}
          onDelete={deleteFixed}
        />
        <VariableExpensesCard
          key={monthPrefix}
          categories={categories}
          expenses={visibleVariable}
          year={year}
          month={month}
          onCreate={createVariable}
          onUpdate={updateVariable}
          onDelete={deleteVariable}
        />
      </div>
    </div>
  );
}