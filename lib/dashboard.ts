import type { Category } from "@/lib/categories";

export type TxType = "income" | "expense";

export type Transaction = {
  id: string;
  date: string; // yyyy-mm-dd
  description: string;
  categoryId: string | null; // receitas não têm categoria
  type: TxType;
  amount: number;
};

export type GoalIcon = "plane" | "piggy" | "laptop" | "home";

export type Goal = {
  id: string;
  name: string;
  icon: GoalIcon;
  current: number;
  target: number;
};

// Tudo que o dashboard precisa. É este o formato que a API deve devolver.
export type DashboardData = {
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
};

export type Period = { start: string; end: string }; // yyyy-mm-dd, inclusivo

export const PRESETS = [
  { key: "month", label: "Este mês" },
  { key: "last-month", label: "Mês passado" },
  { key: "3m", label: "Últimos 3 meses" },
  { key: "6m", label: "Últimos 6 meses" },
  { key: "year", label: "Este ano" },
] as const;

export type PresetKey = (typeof PRESETS)[number]["key"];

// ---------- datas ----------

const MONTH_LABELS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`; // m: 0-11
const toUTC = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const round2 = (n: number) => Math.round(n * 100) / 100;

function addDays(iso: string, n: number) {
  const d = toUTC(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
}

const monthIndex = (key: string) =>
  Number(key.slice(0, 4)) * 12 + Number(key.slice(5, 7)) - 1;
const keyFromIndex = (i: number) => `${Math.floor(i / 12)}-${pad((i % 12) + 1)}`;
const monthLabel = (key: string) =>
  `${MONTH_LABELS[Number(key.slice(5, 7)) - 1]}/${key.slice(2, 4)}`;

export function presetPeriod(key: PresetKey, now = new Date()): Period {
  const y = now.getFullYear();
  const m = now.getMonth();

  if (key === "year") return { start: ymd(y, 0, 1), end: ymd(y, 11, 31) };

  if (key === "last-month") {
    const d = new Date(y, m - 1, 1);
    const py = d.getFullYear();
    const pm = d.getMonth();
    return { start: ymd(py, pm, 1), end: ymd(py, pm, lastDay(py, pm)) };
  }

  const back = key === "3m" ? 2 : key === "6m" ? 5 : 0;
  const s = new Date(y, m - back, 1);
  return {
    start: ymd(s.getFullYear(), s.getMonth(), 1),
    end: ymd(y, m, lastDay(y, m)),
  };
}

function periodMonthKeys(p: Period): string[] {
  const a = monthIndex(p.start.slice(0, 7));
  const b = monthIndex(p.end.slice(0, 7));
  return Array.from({ length: Math.max(0, b - a + 1) }, (_, i) =>
    keyFromIndex(a + i),
  );
}

function isWholeMonths(p: Period) {
  const y = Number(p.end.slice(0, 4));
  const m = Number(p.end.slice(5, 7)) - 1;
  return p.start.endsWith("-01") && Number(p.end.slice(8, 10)) === lastDay(y, m);
}

// Período imediatamente anterior, com o mesmo tamanho
function previousPeriod(p: Period): Period {
  if (isWholeMonths(p)) {
    const n = periodMonthKeys(p).length;
    const a = monthIndex(p.start.slice(0, 7)) - n;
    const startKey = keyFromIndex(a);
    const endKey = keyFromIndex(a + n - 1);
    const y = Number(endKey.slice(0, 4));
    const m = Number(endKey.slice(5, 7)) - 1;
    return { start: `${startKey}-01`, end: ymd(y, m, lastDay(y, m)) };
  }
  const days =
    Math.round((toUTC(p.end).getTime() - toUTC(p.start).getTime()) / 86400000) + 1;
  const end = addDays(p.start, -1);
  return { start: addDays(end, -(days - 1)), end };
}

// ---------- formatação ----------

const pctFormat = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const axisFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

export const formatPct = (v: number) => `${pctFormat.format(Math.abs(v))}%`;
export const formatSignedPct = (v: number) =>
  `${v >= 0 ? "+" : "-"}${formatPct(v)}`;
export const formatAxisMoney = (v: number) => `R$ ${axisFormat.format(v)}`;

// ---------- cálculos ----------

export function pctChange(cur: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((cur - prev) / Math.abs(prev)) * 100;
}

// Fórmula provisória: 100 quando os gastos ficam em até 50% da renda,
// caindo até 0 quando os gastos igualam a renda. Ajuste como preferir.
export function healthScore(income: number, expense: number): number | null {
  if (income <= 0) return expense > 0 ? 0 : null;
  const ratio = expense / income;
  const score = 100 - Math.max(0, ratio - 0.5) * 200;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function healthLabel(score: number | null) {
  if (score === null) return "Sem dados no período";
  if (score >= 70) return "Continue assim!";
  if (score >= 40) return "Atenção aos gastos";
  return "Situação crítica";
}

export type TrendPoint = {
  key: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
};

export type Distribution = {
  id: string;
  name: string;
  color: string;
  value: number;
  pct: number;
};

export type DashboardResult = {
  totalIncome: number;
  totalExpense: number;
  avgIncome: number;
  avgExpense: number;
  balance: number;
  deltaIncome: number | null;
  deltaExpense: number | null;
  deltaBalance: number | null;
  health: number | null;
  compareRef: string; // "ao mês anterior" | "ao período anterior"
  trend: TrendPoint[];
  distribution: Distribution[];
  latest: Transaction[];
};

// Os gráficos de tendência mostram pelo menos 6 meses, terminando no fim do período
const MIN_WINDOW = 6;
const MAX_WINDOW = 12;

const inPeriod = (t: Transaction, p: Period) => t.date >= p.start && t.date <= p.end;

function sumBy(txs: Transaction[], p: Period, type: TxType) {
  return txs.reduce(
    (s, t) => (t.type === type && inPeriod(t, p) ? s + t.amount : s),
    0,
  );
}

export function buildDashboard(
  data: DashboardData,
  period: Period,
): DashboardResult {
  const { transactions, categories } = data;
  const keys = periodMonthKeys(period);
  const months = Math.max(1, keys.length);
  const prev = previousPeriod(period);

  const totalIncome = sumBy(transactions, period, "income");
  const totalExpense = sumBy(transactions, period, "expense");
  const prevIncome = sumBy(transactions, prev, "income");
  const prevExpense = sumBy(transactions, prev, "expense");
  const balance = totalIncome - totalExpense;
  const prevBalance = prevIncome - prevExpense;

  // Totais por mês (para a tendência)
  const byMonth = new Map<string, { income: number; expense: number }>();
  for (const t of transactions) {
    const k = t.date.slice(0, 7);
    const b = byMonth.get(k) ?? { income: 0, expense: 0 };
    b[t.type] += t.amount;
    byMonth.set(k, b);
  }

  const endIdx = monthIndex(period.end.slice(0, 7));
  const size = Math.min(MAX_WINDOW, Math.max(MIN_WINDOW, keys.length));
  const trend: TrendPoint[] = Array.from({ length: size }, (_, i) => {
    const key = keyFromIndex(endIdx - size + 1 + i);
    const b = byMonth.get(key) ?? { income: 0, expense: 0 };
    return {
      key,
      label: monthLabel(key),
      income: round2(b.income),
      expense: round2(b.expense),
      balance: round2(b.income - b.expense),
    };
  });

  // Gastos por categoria no período
  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense" || !inPeriod(t, period)) continue;
    const id = t.categoryId ?? "none";
    byCategory.set(id, (byCategory.get(id) ?? 0) + t.amount);
  }
  const distribution: Distribution[] = [...byCategory.entries()]
    .map(([id, value]) => {
      const cat = categories.find((c) => c.id === id);
      return {
        id,
        name: cat?.name ?? "Sem categoria",
        color: cat?.color ?? "#94a3b8",
        value: round2(value),
        pct: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
      };
    })
    .sort((a, b) => b.value - a.value);

  const latest = transactions
    .filter((t) => inPeriod(t, period))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, 5);

  return {
    totalIncome,
    totalExpense,
    avgIncome: totalIncome / months,
    avgExpense: totalExpense / months,
    balance,
    deltaIncome: pctChange(totalIncome, prevIncome),
    deltaExpense: pctChange(totalExpense, prevExpense),
    deltaBalance: pctChange(balance, prevBalance),
    health: healthScore(totalIncome, totalExpense),
    compareRef:
      keys.length === 1 && isWholeMonths(period)
        ? "ao mês anterior"
        : "ao período anterior",
    trend,
    distribution,
    latest,
  };
}
// ---------- gastos específicos ----------

export type ExpenseItem = {
  key: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  count: number;
  pct: number; // % sobre o total de gastos do período
};

export type SeriesPoint = { label: string; value: number };

const normName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

// Gastos distintos (sem repetir o nome) dentro do período
export function listExpenseItems(
  data: DashboardData,
  period: Period,
): ExpenseItem[] {
  const groups = new Map<
    string,
    { name: string; color: string; icon: string; total: number; count: number }
  >();
  let all = 0;

  for (const t of data.transactions) {
    if (t.type !== "expense" || !inPeriod(t, period)) continue;
    all += t.amount;
    const key = normName(t.description);
    const g = groups.get(key);
    if (g) {
      g.total += t.amount;
      g.count += 1;
    } else {
      const cat = data.categories.find((c) => c.id === t.categoryId);
      groups.set(key, {
        name: t.description.trim(),
        color: cat?.color ?? "#94a3b8",
        icon: cat?.icon ?? "ellipsis",
        total: t.amount,
        count: 1,
      });
    }
  }

  return [...groups.entries()]
    .map(([key, g]) => ({
      key,
      name: g.name,
      color: g.color,
      icon: g.icon,
      total: round2(g.total),
      count: g.count,
      pct: all > 0 ? (g.total / all) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

// Série do gráfico: por mês se o período passa de um mês, senão por dia
export function expenseSeries(
  data: DashboardData,
  period: Period,
  key: string,
): SeriesPoint[] {
  const txs = data.transactions.filter(
    (t) =>
      t.type === "expense" && inPeriod(t, period) && normName(t.description) === key,
  );
  const sum = (list: Transaction[]) =>
    round2(list.reduce((s, t) => s + t.amount, 0));

  const months = periodMonthKeys(period);
  if (months.length > 1) {
    return months.map((m) => ({
      label: monthLabel(m),
      value: sum(txs.filter((t) => t.date.startsWith(m))),
    }));
  }

  const out: SeriesPoint[] = [];
  for (let d = period.start; d <= period.end; d = addDays(d, 1)) {
    out.push({ label: d.slice(8, 10), value: sum(txs.filter((t) => t.date === d)) });
  }
  return out;
}