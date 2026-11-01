"use client";

import { useMemo } from "react";
import type { Category } from "@/lib/categories";
import { buildDashboardData } from "@/lib/dashboardData";
import type { Income } from "@/lib/incomes";
import type { FixedExpense, VariableExpense } from "@/lib/expenses";
import type { SavingsPlan } from "@/lib/plans";
import { useUserData } from "@/lib/useUserData";

// Tudo que o Dashboard e as Previsões precisam, lido do banco local do usuário
export function useFinanceData() {
  const categories = useUserData<Category>("categorias");
  const incomes = useUserData<Income>("rendas");
  const fixed = useUserData<FixedExpense>("gastos-fixos");
  const variable = useUserData<VariableExpense>("gastos-variaveis");
  const savings = useUserData<SavingsPlan>("caixinhas");

  const data = useMemo(
    () =>
      buildDashboardData({
        categories: categories.items,
        incomes: incomes.items,
        fixed: fixed.items,
        variable: variable.items,
        savings: savings.items,
      }),
    [categories.items, incomes.items, fixed.items, variable.items, savings.items],
  );

  const all = [categories, incomes, fixed, variable, savings];
  return {
    data,
    savings,
    fixed: fixed.items,
    loading: all.some((d) => d.loading),
    error: all.find((d) => d.error)?.error ?? null,
  };
}
