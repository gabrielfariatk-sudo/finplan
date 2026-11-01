"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  HeartPulse,
  LayoutGrid,
  Lightbulb,
  PieChart as PieIcon,
  ReceiptText,
  Target,
  TrendingUp,
} from "lucide-react";
import { buildDashboard, presetPeriod } from "@/lib/dashboard";
import DataNotice from "@/components/DataNotice";
import { useFinanceData } from "@/lib/useFinanceData";
import { formatBRL } from "@/lib/expenses";
import Card, { DASH_CARD } from "./Card";
import PeriodFilter, { type PeriodState } from "./PeriodFilter";
import KpiCards from "./KpiCards";
import { ExpenseDistribution, ExpenseEvolution, IncomeExpenseChart } from "./Charts";
import { GoalsList, InsightsList, LatestTransactions } from "./Panels";
import FloatingNav from "./FloatingNav";
import SpecificExpensesPanel from "./SpecificExpensesPanel";

// Só "Geral por período" está pronto; os outros entram depois
const VIEWS = [
  { label: "Geral por período", icon: CalendarDays, ready: true },
  { label: "Por categoria", icon: LayoutGrid, ready: false },
  { label: "Queda de gasto", icon: ArrowDown, ready: false },
  { label: "Aumento de gasto", icon: ArrowUpRight, ready: false },
  { label: "Saúde financeira", icon: HeartPulse, ready: false },
];

const LEGEND = [
  { label: "Receitas", color: "#10d9a0" },
  { label: "Despesas", color: "#8b5cf6" },
  { label: "Saldo", color: "#60a5fa" },
];

export default function DashboardView() {
  const [range, setRange] = useState<PeriodState>(() => ({
    key: "month",
    period: presetPeriod("month"),
  }));
  const [specificOpen, setSpecificOpen] = useState(false);

  // Dados do usuário vindos do banco local (rendas, gastos fixos e variáveis, metas)
  const { data, loading, error } = useFinanceData();

  const result = useMemo(
    () => buildDashboard(data, range.period),
    [data, range.period],
  );

  const lastLabel = result.trend[result.trend.length - 1]?.label;

  return (
    <>
      {/* O espaço extra embaixo evita que o painel cubra o fim da página */}
      <div
        className={`mx-auto flex max-w-[1600px] flex-col gap-3 ${
          specificOpen ? "pb-80" : ""
        }`}
      >
        <DataNotice loading={loading} error={error} />

        {/* Tipo de visualização + filtro de período */}
        <div className="relative z-30 flex flex-wrap items-start gap-3">
          <div className={`min-w-0 flex-1 p-3 ${DASH_CARD}`}>
            <p className="mb-2 text-xs font-medium text-white/80">Tipo de visualização</p>
            <div className="flex flex-wrap gap-2">
              {VIEWS.map(({ label, icon: Icon, ready }) => (
                <button
                  key={label}
                  type="button"
                  disabled={!ready}
                  title={ready ? undefined : "Em breve"}
                  aria-pressed={ready}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    ready
                      ? "border-purple-400 bg-linear-to-r from-purple-600 to-violet-600 text-white shadow-[0_0_14px_rgba(124,58,237,0.5)]"
                      : "cursor-not-allowed border-white/10 bg-white/5 text-white/45"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <PeriodFilter value={range} onChange={setRange} />
        </div>

        <KpiCards result={result} />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12">
          <Card
            className="lg:col-span-5"
            icon={BarChart3}
            title="Receitas x Despesas"
            subtitle={`Últimos ${result.trend.length} meses até ${lastLabel}`}
            action={
              <ul className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[10px] text-white/70">
                {LEGEND.map((l) => (
                  <li key={l.label} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                    {l.label}
                  </li>
                ))}
              </ul>
            }
          >
            <IncomeExpenseChart trend={result.trend} />
          </Card>

          <Card
            className="lg:col-span-4"
            icon={PieIcon}
            title="Distribuição de Gastos"
            subtitle="Por categoria no período."
          >
            <ExpenseDistribution items={result.distribution} total={result.totalExpense} />
          </Card>

          <Card className="lg:col-span-3" icon={Lightbulb} title="Análise e Insights">
            <InsightsList result={result} />
          </Card>

          <Card className="lg:col-span-5" icon={ReceiptText} title="Últimos Lançamentos">
            <LatestTransactions items={result.latest} categories={data.categories} />
          </Card>

          <Card
            className="lg:col-span-4"
            icon={TrendingUp}
            title="Evolução dos Gastos"
            subtitle={`Comparativo mensal dos últimos ${result.trend.length} meses.`}
          >
            <ExpenseEvolution trend={result.trend} />
          </Card>

          <Card
            className="lg:col-span-3"
            icon={Target}
            title="Metas e Objetivos"
            subtitle={`${data.goals.length} ${data.goals.length === 1 ? "meta" : "metas"} em andamento`}
          >
            <GoalsList goals={data.goals} />
          </Card>
        </div>

        <p className="pb-2 text-center text-[11px] text-white/45">
          Saldo acumulado no período: {formatBRL(result.balance)}
        </p>
      </div>

      <FloatingNav
        specificOpen={specificOpen}
        onToggleSpecific={() => setSpecificOpen((v) => !v)}
      />

      <SpecificExpensesPanel
        open={specificOpen}
        onClose={() => setSpecificOpen(false)}
        data={data}
        period={range.period}
      />
    </>
  );
}