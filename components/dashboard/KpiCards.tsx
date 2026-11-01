import type { ReactNode } from "react";
import { Percent, Receipt, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { formatBRL } from "@/lib/expenses";
import { formatSignedPct, type DashboardResult } from "@/lib/dashboard";
import { DASH_CARD } from "./Card";

function Sparkline({
  values,
  color,
  id,
}: {
  values: number[];
  color: string;
  id: string;
}) {
  if (values.length < 2) return null;
  const w = 84;
  const h = 36;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - pad - ((v - min) / span) * (h - pad * 2),
  ]);
  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w} ${h} L0 ${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Delta({
  value,
  goodWhenUp,
  reference,
}: {
  value: number | null;
  goodWhenUp: boolean;
  reference: string;
}) {
  if (value === null) {
    return <p className="mt-0.5 text-[11px] text-white/50">Sem dados para comparar</p>;
  }
  const up = value >= 0;
  const good = up === goodWhenUp;
  return (
    <div className="mt-0.5">
      <p className={`text-[11px] font-semibold ${good ? "text-emerald-400" : "text-rose-400"}`}>
        {up ? "▲" : "▼"} {formatSignedPct(value)}
      </p>
      <p className="text-[11px] text-white/55">Comparado {reference}</p>
    </div>
  );
}

function KpiShell({
  icon: Icon,
  iconClass,
  title,
  children,
}: {
  icon: LucideIcon;
  iconClass: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={`p-4 ${DASH_CARD}`}>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xs text-white/80">{title}</p>
      </div>
      {children}
    </div>
  );
}

export default function KpiCards({ result }: { result: DashboardResult }) {
  const { trend } = result;
  const healthPct = result.health;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiShell icon={TrendingUp} iconClass="bg-emerald-500 text-white" title="Receita Média Mensal">
        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-xl font-bold">{formatBRL(result.avgIncome)}</p>
            <Delta value={result.deltaIncome} goodWhenUp reference={result.compareRef} />
          </div>
          <Sparkline id="spark-income" color="#10d9a0" values={trend.map((t) => t.income)} />
        </div>
      </KpiShell>

      <KpiShell icon={Receipt} iconClass="bg-purple-500 text-white" title="Gasto Médio Mensal">
        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className="text-xl font-bold">{formatBRL(result.avgExpense)}</p>
            <Delta value={result.deltaExpense} goodWhenUp={false} reference={result.compareRef} />
          </div>
          <Sparkline id="spark-expense" color="#a78bfa" values={trend.map((t) => t.expense)} />
        </div>
      </KpiShell>

      <KpiShell icon={Percent} iconClass="bg-blue-500 text-white" title="Percentual de Saúde Financeira">
        <p className="mt-2 text-xl font-bold">{healthPct === null ? "—" : `${healthPct}%`}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-linear-to-r from-purple-500 to-blue-400 transition-[width] duration-500"
            style={{ width: `${healthPct ?? 0}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-white/55">Baseado em renda x despesas</p>
      </KpiShell>

      <KpiShell icon={Wallet} iconClass="bg-violet-500 text-white" title="Saldo do Período">
        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <p className={`text-xl font-bold ${result.balance < 0 ? "text-rose-300" : ""}`}>
              {formatBRL(result.balance)}
            </p>
            <Delta value={result.deltaBalance} goodWhenUp reference={result.compareRef} />
          </div>
          <Sparkline id="spark-balance" color="#60a5fa" values={trend.map((t) => t.balance)} />
        </div>
      </KpiShell>
    </div>
  );
}