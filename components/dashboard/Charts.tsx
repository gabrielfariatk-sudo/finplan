"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBRL } from "@/lib/expenses";
import {
  formatAxisMoney,
  formatPct,
  pctChange,
  type Distribution,
  type TrendPoint,
} from "@/lib/dashboard";
import { EmptyState } from "./Card";

const AXIS_TICK = { fill: "rgba(255,255,255,0.65)", fontSize: 11 };
const GRID = "rgba(255,255,255,0.10)";
const TOOLTIP_PROPS = {
  contentStyle: {
    background: "#120a45",
    border: "1px solid rgba(167,139,250,0.4)",
    borderRadius: 8,
    fontSize: 12,
    color: "#fff",
  },
  labelStyle: { color: "#fff" },
  itemStyle: { color: "#fff" },
  cursor: { fill: "rgba(255,255,255,0.06)" },
  formatter: (value: unknown) => formatBRL(Number(value)),
};

// ---------- Receitas x Despesas ----------

export function IncomeExpenseChart({ trend }: { trend: TrendPoint[] }) {
  if (!trend.some((t) => t.income > 0 || t.expense > 0)) {
    return <EmptyState text="Sem movimentações no período." />;
  }
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={64} tickFormatter={formatAxisMoney} />
          <Tooltip {...TOOLTIP_PROPS} />
          <Bar dataKey="income" name="Receitas" fill="#10d9a0" radius={[3, 3, 0, 0]} maxBarSize={14} />
          <Bar dataKey="expense" name="Despesas" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={14} />
          <Line dataKey="balance" name="Saldo" type="monotone" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: "#60a5fa", stroke: "none" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- Distribuição de gastos ----------

export function ExpenseDistribution({
  items,
  total,
}: {
  items: Distribution[];
  total: number;
}) {
  if (items.length === 0) return <EmptyState text="Sem gastos no período." />;
  return (
    <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {items.map((i) => (
                <Cell key={i.id} fill={i.color} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP_PROPS} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-white/60">Total de Gastos</span>
          <span className="text-sm font-semibold">{formatBRL(total)}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-1.5 text-[11px]">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: i.color }} />
            <span className="min-w-0 flex-1 truncate text-white/90">{i.name}</span>
            <span className="w-9 text-right text-white/60">{Math.round(i.pct)}%</span>
            <span className="w-20 text-right">{formatBRL(i.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Evolução dos gastos ----------

export function ExpenseEvolution({ trend }: { trend: TrendPoint[] }) {
  if (!trend.some((t) => t.expense > 0)) {
    return <EmptyState text="Sem gastos para exibir." />;
  }

  const first = trend[0].expense;
  const last = trend[trend.length - 1].expense;
  const change = pctChange(last, first);

  let note = "Sem gastos no primeiro mês exibido para comparar.";
  let tone: "good" | "bad" | "neutral" = "neutral";
  if (change !== null) {
    if (Math.abs(change) < 0.05) {
      note = "Seus gastos ficaram estáveis em relação ao primeiro mês exibido.";
    } else {
      tone = change < 0 ? "good" : "bad";
      note = `Seus gastos ${change < 0 ? "diminuíram" : "aumentaram"} ${formatPct(change)} em comparação ao primeiro mês exibido.`;
    }
  }

  const toneClass = {
    good: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
    bad: "border-rose-400/40 bg-rose-500/10 text-rose-200",
    neutral: "border-purple-400/30 bg-purple-500/10 text-purple-100",
  }[tone];

  return (
    <>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="evolution-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={64} tickFormatter={formatAxisMoney} />
            <Tooltip {...TOOLTIP_PROPS} />
            <Area
              dataKey="expense"
              name="Gastos"
              type="monotone"
              stroke="#a78bfa"
              strokeWidth={2}
              fill="url(#evolution-fill)"
              dot={{ r: 3, fill: "#f472b6", stroke: "none" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className={`mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] ${toneClass}`}>
        {tone === "good" && <ArrowDown className="h-4 w-4 shrink-0" />}
        {tone === "bad" && <ArrowUp className="h-4 w-4 shrink-0" />}
        {note}
      </p>
    </>
  );
}