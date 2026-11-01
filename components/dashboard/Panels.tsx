import {
  ArrowDown,
  ArrowUp,
  HeartPulse,
  House,
  Info,
  Laptop,
  PiggyBank,
  Plane,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ICONS, type Category } from "@/lib/categories";
import { formatBRL, formatDate } from "@/lib/expenses";
import {
  formatPct,
  healthLabel,
  type DashboardResult,
  type Goal,
  type GoalIcon,
  type Transaction,
} from "@/lib/dashboard";
import { EmptyState } from "./Card";

// ---------- Análise e Insights ----------

type Tone = "good" | "bad" | "warn" | "neutral";

const TONES: Record<Tone, { box: string; icon: string; strong: string }> = {
  good: { box: "border-emerald-400/40 bg-emerald-500/10", icon: "bg-emerald-500/25 text-emerald-300", strong: "text-emerald-300" },
  bad: { box: "border-rose-400/40 bg-rose-500/10", icon: "bg-rose-500/25 text-rose-300", strong: "text-rose-300" },
  warn: { box: "border-amber-400/40 bg-amber-500/10", icon: "bg-amber-500/25 text-amber-300", strong: "text-amber-300" },
  neutral: { box: "border-purple-400/30 bg-purple-500/10", icon: "bg-purple-500/30 text-purple-200", strong: "text-purple-200" },
};

type Insight = {
  icon: LucideIcon;
  tone: Tone;
  lead: string;
  strong: string;
  text: string;
};

export function InsightsList({ result }: { result: DashboardResult }) {
  const items: Insight[] = [];

  if (result.deltaExpense !== null) {
    const down = result.deltaExpense <= 0;
    items.push({
      icon: down ? ArrowDown : ArrowUp,
      tone: down ? "good" : "bad",
      lead: `Seus gastos ${down ? "caíram" : "aumentaram"}`,
      strong: formatPct(result.deltaExpense),
      text: `em relação ${result.compareRef}.`,
    });
  }

  if (result.deltaIncome !== null) {
    const up = result.deltaIncome >= 0;
    items.push({
      icon: up ? ArrowUp : ArrowDown,
      tone: up ? "good" : "bad",
      lead: `Sua receita ${up ? "aumentou" : "diminuiu"}`,
      strong: formatPct(result.deltaIncome),
      text: `em relação ${result.compareRef}.`,
    });
  }

  const top = result.distribution[0];
  if (top) {
    items.push({
      icon: Info,
      tone: "neutral",
      lead: "Maior gasto:",
      strong: top.name,
      text: `${Math.round(top.pct)}% do total · ${formatBRL(top.value)}`,
    });
  }

  if (result.health !== null) {
    items.push({
      icon: HeartPulse,
      tone: result.health >= 70 ? "good" : result.health >= 40 ? "warn" : "bad",
      lead: "Sua saúde financeira está em",
      strong: `${result.health}%`,
      text: healthLabel(result.health),
    });
  }

  if (items.length === 0) {
    return <EmptyState text="Cadastre receitas e gastos para ver as análises." />;
  }

  return (
    <ul className="space-y-2">
      {items.map((it) => {
        const t = TONES[it.tone];
        const Icon = it.icon;
        return (
          <li key={it.lead} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${t.box}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${t.icon}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium">
                {it.lead} <span className={t.strong}>{it.strong}</span>
              </p>
              <p className="text-[11px] text-white/60">{it.text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ---------- Últimos Lançamentos ----------

export function LatestTransactions({
  items,
  categories,
}: {
  items: Transaction[];
  categories: Category[];
}) {
  if (items.length === 0) return <EmptyState text="Nenhum lançamento no período." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-110 text-left text-[11px]">
        <thead className="text-white/55">
          <tr className="border-b border-white/10">
            <th className="py-1.5 pr-2 font-medium">Data</th>
            <th className="py-1.5 pr-2 font-medium">Descrição</th>
            <th className="py-1.5 pr-2 font-medium">Categoria</th>
            <th className="py-1.5 pr-2 font-medium">Tipo</th>
            <th className="py-1.5 text-right font-medium">Valor</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => {
            const income = t.type === "income";
            const cat = categories.find((c) => c.id === t.categoryId);
            const Icon = income ? Wallet : (cat ? ICONS[cat.icon] : null) ?? ICONS.ellipsis;
            const color = income ? "#10b981" : (cat?.color ?? "#94a3b8");
            return (
              <tr key={t.id} className="border-b border-white/5 last:border-0">
                <td className="py-2 pr-2 text-white/80">{formatDate(t.date)}</td>
                <td className="py-2 pr-2">
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded" style={{ backgroundColor: color }}>
                      <Icon className="h-3 w-3 text-white" />
                    </span>
                    <span className="truncate">{t.description}</span>
                  </span>
                </td>
                <td className="py-2 pr-2 text-white/80">
                  {income ? "Renda" : (cat?.name ?? "Sem categoria")}
                </td>
                <td className="py-2 pr-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-medium ring-1 ${
                      income
                        ? "bg-emerald-500/20 text-emerald-300 ring-emerald-400/40"
                        : "bg-rose-500/20 text-rose-300 ring-rose-400/40"
                    }`}
                  >
                    {income ? "Receita" : "Despesa"}
                  </span>
                </td>
                <td className="py-2 text-right font-medium">{formatBRL(t.amount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Metas e Objetivos ----------

const GOAL_ICONS: Record<GoalIcon, LucideIcon> = {
  plane: Plane,
  piggy: PiggyBank,
  laptop: Laptop,
  home: House,
};
const GOAL_COLORS = ["#8b5cf6", "#10d9a0", "#a78bfa", "#f59e0b"];

export function GoalsList({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) return <EmptyState text="Nenhuma meta cadastrada." />;

  return (
    <ul className="space-y-3">
      {goals.map((g, i) => {
        const Icon = GOAL_ICONS[g.icon];
        const color = GOAL_COLORS[i % GOAL_COLORS.length];
        const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
        return (
          <li key={g.id} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/25 text-purple-100">
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-xs font-medium">{g.name}</span>
                <span className="shrink-0 text-[10px] text-white/55">
                  {formatBRL(g.current)} / {formatBRL(g.target)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
                <span className="w-8 text-right text-[10px] text-white/70">{pct}%</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}