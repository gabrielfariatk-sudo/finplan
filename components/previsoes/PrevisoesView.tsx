"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import DataNotice from "@/components/DataNotice";
import { useFinanceData } from "@/lib/useFinanceData";
import { useUserData } from "@/lib/useUserData";
import { formatBRL } from "@/lib/expenses";
import { buildForecast } from "@/lib/forecast";
import { buildRuleInsights } from "@/lib/ruleInsights";
import { configForMonth, monthKey } from "@/lib/calcConfig";
import { fixedMonthlyTotal } from "@/lib/rules";
import { useCalcConfig } from "@/lib/useCalcConfig";
import {
  pauseFromNextMonth,
  reserveProgress,
  reserveStatus,
  resumeNow,
  type EmergencyReserve,
  type ReserveInput,
} from "@/lib/reserve";
import type { DebtInput, DebtPlan, SavingsInput } from "@/lib/plans";
import ReserveCard from "./ReserveCard";
import ReserveModal from "./ReserveModal";
import PiggyCard from "./PiggyCard";
import DebtCard from "./DebtCard";
import InsightsSection from "./InsightsSection";
import SavingsModal from "./SavingsModal";
import DebtModal from "./DebtModal";

const PILL =
  "rounded-xl border border-purple-400/40 bg-[#0c0533]/80 px-4 py-2 text-xs " +
  "text-white backdrop-blur-md";

export default function PrevisoesView() {
  // Tudo vem do banco local do usuário: rendas, gastos, caixinhas e dívidas
  const finance = useFinanceData();
  const debtsDb = useUserData<DebtPlan>("dividas");
  const reserveDb = useUserData<EmergencyReserve>("reserva");
  const calc = useCalcConfig();
  const { data, savings: savingsDb, fixed } = finance;
  const savings = savingsDb.items;
  const debts = debtsDb.items;
  const reserve = reserveDb.items[0] ?? null;
  const [modal, setModal] = useState<"savings" | "debt" | "reserve" | null>(null);

  // Mês atual, regras (Base de Cálculo) e situação da reserva
  const nowKey = monthKey(new Date());
  const cfg = configForMonth(calc.versions, nowKey);
  const fixedMonthly = useMemo(() => {
    const d = new Date();
    return fixedMonthlyTotal(fixed, d.getFullYear(), d.getMonth());
  }, [fixed]);
  const progress = useMemo(
    () => (reserve ? reserveProgress(reserve, fixedMonthly, nowKey) : null),
    [reserve, fixedMonthly, nowKey],
  );
  const status = reserve ? reserveStatus(reserve, nowKey) : null;

  // Dicas: as da regra de negócio de destaque primeiro, depois as de análise, depois as demais da regra
  const forecast = useMemo(() => {
    const base = buildForecast(data);
    const rules = buildRuleInsights({ data, versions: calc.versions, reserve, savings, debts, fixed });
    return {
      ...base,
      insights: [...rules.filter((i) => i.wide), ...base.insights, ...rules.filter((i) => !i.wide)],
    };
  }, [data, calc.versions, reserve, savings, debts, fixed]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showDown, setShowDown] = useState(false);

  const updateScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setShowDown(el.scrollTop + el.clientHeight < el.scrollHeight - 40);
  }, []);

  useEffect(() => {
    updateScroll();
    window.addEventListener("resize", updateScroll);
    return () => window.removeEventListener("resize", updateScroll);
  }, [updateScroll, savings.length, debts.length, reserve]);

  function scrollDown() {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ top: el.clientHeight * 0.8, behavior: "smooth" });
  }

  function addSavings(input: SavingsInput) {
    savingsDb.create(input);
  }
  function addDebt(input: DebtInput) {
    debtsDb.create(input);
  }

  // ---- Reserva de emergência ----
  function saveReserve(input: ReserveInput) {
    if (reserve) reserveDb.update(reserve.id, input);
    else reserveDb.create(input);
  }
  function handleInsightAction(key: string) {
    if (key === "dismiss-milestone" && reserve && progress) {
      reserveDb.update(reserve.id, { dismissed: progress.achieved }); // dispensa o aviso
    }
  }

  return (
    <>
      <div
        ref={scrollerRef}
        onScroll={updateScroll}
        className="absolute inset-0 z-10 overflow-y-auto px-4 pb-20 pt-4 md:px-6"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <DataNotice
            loading={finance.loading || debtsDb.loading || reserveDb.loading || calc.loading}
            error={finance.error ?? debtsDb.error ?? reserveDb.error ?? calc.error}
          />

          {/* Indicadores */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className={`flex items-center gap-2 ${PILL}`}>
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="leading-tight">
                API
                <br />
                Ativa
              </span>
            </div>
            <div className={`leading-tight ${PILL}`}>
              <span className="text-white/70">Renda Base: </span>
              <strong className="text-purple-300">
                {formatBRL(forecast.baseIncome)}
              </strong>
            </div>
          </div>

          <ReserveCard
            reserve={reserve}
            progress={progress}
            status={status}
            onConfigure={() => setModal("reserve")}
            onToggle={(active) => reserve && reserveDb.update(reserve.id, { active })}
            onPause={() => reserve && reserveDb.update(reserve.id, { pauses: pauseFromNextMonth(reserve) })}
            onResume={() => reserve && reserveDb.update(reserve.id, { pauses: resumeNow(reserve) })}
          />
          <PiggyCard goals={savings} onRegister={() => setModal("savings")} config={cfg} />
          <DebtCard debts={debts} onPlan={() => setModal("debt")} config={cfg} />
          <InsightsSection forecast={forecast} onAction={handleInsightAction} />
        </div>
      </div>

      {showDown && (
        <button
          type="button"
          onClick={scrollDown}
          aria-label="Rolar para baixo"
          className="absolute bottom-4 left-1/2 z-20 flex h-12 w-12 -translate-x-1/2
                     items-center justify-center rounded-full bg-white text-[#120a45]
                     shadow-[0_6px_20px_rgba(0,0,0,0.45)] transition-transform hover:scale-105"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}

      {modal === "savings" && (
        <SavingsModal onClose={() => setModal(null)} onConfirm={addSavings} />
      )}
      {modal === "reserve" && (
        <ReserveModal
          initial={reserve}
          fixedMonthly={fixedMonthly}
          suggestedMonthly={Math.round((forecast.baseIncome * cfg.orcamento_regra_50_30_20.investimento_pct) / 100)}
          investPct={cfg.orcamento_regra_50_30_20.investimento_pct}
          onClose={() => setModal(null)}
          onSave={saveReserve}
        />
      )}
      {modal === "debt" && (
        <DebtModal onClose={() => setModal(null)} onConfirm={addDebt} />
      )}
    </>
  );
}