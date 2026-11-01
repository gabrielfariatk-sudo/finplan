import type { Category } from "@/lib/categories";
import type { DashboardData, Goal, Transaction } from "@/lib/dashboard";
import type { Income } from "@/lib/incomes";
import type { FixedExpense, VariableExpense } from "@/lib/expenses";
import type { SavingsPlan } from "@/lib/plans";

export type FinanceInputs = {
  categories: Category[];
  incomes: Income[];
  fixed: FixedExpense[];
  variable: VariableExpense[];
  savings: SavingsPlan[];
};

const pad = (n: number) => String(n).padStart(2, "0");
const monthIdx = (ym: string) => Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5, 7)) - 1;
const firstDay = (idx: number) => `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}-01`;
const MAX_MONTHS = 120;

/**
 * Transforma o que o usuário cadastrou (rendas, gastos fixos e variáveis, caixinhas)
 * nas transações mensais que o Dashboard e as Previsões analisam.
 * Rendas e gastos recorrentes são expandidos mês a mês, até o mês atual.
 */
export function buildDashboardData(input: FinanceInputs, now = new Date()): DashboardData {
  const nowIdx = now.getFullYear() * 12 + now.getMonth();
  const transactions: Transaction[] = [];

  for (const inc of input.incomes) {
    if (inc.kind === "one-off") {
      if (!inc.start || monthIdx(inc.start) > nowIdx) continue;
      transactions.push({
        id: `inc-${inc.id}`, date: firstDay(monthIdx(inc.start)), description: inc.name,
        categoryId: null, type: "income", amount: inc.amount,
      });
      continue;
    }
    const from = inc.start ? monthIdx(inc.start) : nowIdx - 23;
    const to = Math.min(inc.end ? monthIdx(inc.end) : nowIdx, nowIdx);
    for (let i = from; i <= to && i - from < MAX_MONTHS; i++) {
      transactions.push({
        id: `inc-${inc.id}-${i}`, date: firstDay(i), description: inc.name,
        categoryId: null, type: "income", amount: inc.amount,
      });
    }
  }

  for (const e of input.fixed) {
    const last = e.duration === null ? nowIdx : e.startIndex + e.duration - 1;
    const to = Math.min(last, nowIdx);
    for (let i = e.startIndex; i <= to && i - e.startIndex < MAX_MONTHS; i++) {
      transactions.push({
        id: `fix-${e.id}-${i}`, date: firstDay(i), description: e.name,
        categoryId: e.categoryId, type: "expense", amount: e.amount,
      });
    }
  }

  for (const e of input.variable) {
    transactions.push({
      id: `var-${e.id}`, date: e.date, description: e.name,
      categoryId: e.categoryId, type: "expense", amount: e.amount,
    });
  }

  const goals: Goal[] = input.savings.map((s) => ({
    id: s.id, name: s.name, icon: "piggy", current: s.saved, target: s.target,
  }));

  return { categories: input.categories, transactions, goals };
}
