// Regras de negócio da API (código puro). Tudo parte da Base de Cálculo do usuário.
import type { Category } from "@/lib/categories";
import { CATEGORY_GROUPS, type CategoryGroup } from "@/lib/categoryGroups";
import type { CalcConfig } from "@/lib/calcConfig";
import type { Transaction } from "@/lib/dashboard";
import { isFixedActive, type FixedExpense } from "@/lib/expenses";

// ---------- Orçamento 50/30/20 ----------

export type BudgetLine = {
  group: CategoryGroup;
  label: string; // "Necessidades", "Desejos", "Investimento"
  actual: number; // R$ no mês
  pct: number; // % da renda, inteiro (mesmo número que o usuário vê)
  limitPct: number;
  kind: "teto" | "piso"; // necessidades e desejos têm teto; investimento tem piso
  ok: boolean;
  gap: number; // R$ acima do teto / abaixo do piso (0 se ok)
};

export type BudgetResult = { income: number; lines: BudgetLine[]; deviations: BudgetLine[] };

const GROUP_LABEL: Record<CategoryGroup, string> = {
  necessidade: "Necessidades",
  desejo: "Desejos",
  investimento: "Investimento",
};

/**
 * Avalia um mês contra a regra. `extraInvestment` = aportes da reserva e das caixinhas
 * (entram como Investimento). Gastos sem categoria conhecida contam como Desejo.
 * Sem renda no mês não há o que avaliar (retorna null).
 */
export function evaluateBudget(args: {
  categories: Category[];
  transactions: Transaction[];
  month: string; // yyyy-mm
  config: CalcConfig;
  extraInvestment?: number;
}): BudgetResult | null {
  const { categories, transactions, month, config } = args;
  const groupOf = new Map(categories.map((c) => [c.id, c.group]));

  let income = 0;
  const actual: Record<CategoryGroup, number> = { necessidade: 0, desejo: 0, investimento: args.extraInvestment ?? 0 };
  for (const t of transactions) {
    if (!t.date.startsWith(month)) continue;
    if (t.type === "income") income += t.amount;
    else actual[(t.categoryId && groupOf.get(t.categoryId)) || "desejo"] += t.amount;
  }
  if (income <= 0) return null;

  const r = config.orcamento_regra_50_30_20;
  const limits: Record<CategoryGroup, number> = {
    necessidade: r.necessidades_pct,
    desejo: r.desejos_pct,
    investimento: r.investimento_pct,
  };

  const lines: BudgetLine[] = CATEGORY_GROUPS.map(({ key }) => {
    const kind = key === "investimento" ? "piso" : "teto";
    const pct = Math.round((actual[key] / income) * 100);
    const ok = kind === "teto" ? pct <= limits[key] : pct >= limits[key];
    const limitAmount = (limits[key] / 100) * income;
    const gap = ok ? 0 : Math.round(Math.abs(actual[key] - limitAmount) * 100) / 100;
    return { group: key, label: GROUP_LABEL[key], actual: Math.round(actual[key] * 100) / 100, pct, limitPct: limits[key], kind, ok, gap };
  });

  return { income, lines, deviations: lines.filter((l) => !l.ok) };
}

// ---------- Reserva ----------

/** Despesas fixas do mês (base de cálculo da reserva de emergência). */
export function fixedMonthlyTotal(fixed: FixedExpense[], year: number, month0: number) {
  return Math.round(fixed.filter((e) => isFixedActive(e, year, month0)).reduce((s, e) => s + e.amount, 0) * 100) / 100;
}

/** Faixa recomendada de reserva (R$) = despesas fixas x meses mínimo/máximo. */
export function reserveRange(fixedMonthly: number, config: CalcConfig) {
  const r = config.reserva_emergencia;
  return { min: Math.round(fixedMonthly * r.meses_minimo * 100) / 100, max: Math.round(fixedMonthly * r.meses_maximo * 100) / 100 };
}

// ---------- Horizonte temporal ----------

export type Horizon = "curto" | "medio" | "longo";
export const HORIZON_LABEL: Record<Horizon, string> = { curto: "Curto prazo", medio: "Médio prazo", longo: "Longo prazo" };

export function horizonOf(months: number, config: CalcConfig): Horizon {
  const h = config.horizontes_temporais_meses;
  if (months <= h.curto_prazo.max) return "curto";
  if (months <= h.medio_prazo.max) return "medio";
  return "longo";
}
