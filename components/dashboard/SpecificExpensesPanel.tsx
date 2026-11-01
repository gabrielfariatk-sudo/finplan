"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ICONS } from "@/lib/categories";
import { formatBRL } from "@/lib/expenses";
import {
  expenseSeries,
  formatAxisMoney,
  listExpenseItems,
  type DashboardData,
  type Period,
} from "@/lib/dashboard";
import { DASH_CARD, EmptyState } from "./Card";

type Props = {
  open: boolean;
  onClose: () => void;
  data: DashboardData;
  period: Period;
};

const AXIS_TICK = { fill: "rgba(255,255,255,0.65)", fontSize: 11 };

export default function SpecificExpensesPanel({
  open,
  onClose,
  data,
  period,
}: Props) {
  const items = useMemo(() => listExpenseItems(data, period), [data, period]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Se o gasto escolhido saiu do período, volta para o primeiro da lista
  const selected = items.find((i) => i.key === selectedKey) ?? items[0] ?? null;

  const series = useMemo(
    () => (selected ? expenseSeries(data, period, selected.key) : []),
    [data, period, selected],
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [open, items.length, updateArrows]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function scrollByPage(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  if (!open) return null;

  const average = selected ? selected.total / selected.count : 0;

  return (
    <section
      role="dialog"
      aria-label="Visualização de gastos específicos"
      className={`fixed bottom-4 left-1/2 z-40 max-h-[70vh] w-[min(94vw,60rem)]
                  -translate-x-1/2 overflow-y-auto p-4 ${DASH_CARD} bg-[#0c0533]/95`}
    >
      {/* Cabeçalho */}
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/25 text-purple-200">
            <Eye className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <div>
            <h2 className="text-sm font-semibold">
              Visualização de gastos específicos
            </h2>
            <p className="text-[11px] text-white/60">
              Escolha um gasto para ver o valor e a evolução no período filtrado.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {items.length === 0 || !selected ? (
        <EmptyState text="Nenhum gasto no período selecionado." />
      ) : (
        <>
          {/* Carrossel de gastos (sem repetir) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              disabled={!canLeft}
              aria-label="Gastos anteriores"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                         border border-white/25 bg-white/10 transition-opacity
                         hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div
              ref={trackRef}
              onScroll={updateArrows}
              className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto
                         scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {items.map((it) => {
                const Icon = ICONS[it.icon] ?? ICONS.ellipsis;
                const active = it.key === selected.key;
                return (
                  <button
                    key={it.key}
                    type="button"
                    onClick={() => setSelectedKey(it.key)}
                    aria-pressed={active}
                    className={`flex w-40 shrink-0 snap-start items-center gap-2 rounded-lg
                                border px-2.5 py-2 text-left text-xs transition-colors ${
                                  active
                                    ? "border-purple-300 bg-purple-600/40 text-white"
                                    : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
                                }`}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: it.color }}
                    >
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{it.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollByPage(1)}
              disabled={!canRight}
              aria-label="Próximos gastos"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                         border border-white/25 bg-white/10 transition-opacity
                         hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Valor + gráfico do gasto escolhido */}
          <div className="mt-4 grid gap-4 md:grid-cols-[14rem_1fr]">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="truncate text-xs text-white/70">{selected.name}</p>
              <p className="mt-1 text-2xl font-bold">
                {formatBRL(selected.total)}
              </p>
              <p className="text-[11px] text-white/55">total no período</p>

              <dl className="mt-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-white/60">Lançamentos</dt>
                  <dd className="font-medium">{selected.count}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/60">Média por lançamento</dt>
                  <dd className="font-medium">{formatBRL(average)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/60">Do total de gastos</dt>
                  <dd className="font-medium">{Math.round(selected.pct)}%</dd>
                </div>
              </dl>
            </div>

            <div className="h-44 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={series}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.10)" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tickFormatter={formatAxisMoney}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#120a45",
                      border: "1px solid rgba(167,139,250,0.4)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ fill: "rgba(255,255,255,0.06)" }}
                    formatter={(value: unknown) => [formatBRL(Number(value)), selected.name]}
                  />
                  <Bar
                    dataKey="value"
                    fill={selected.color}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </section>
  );
}