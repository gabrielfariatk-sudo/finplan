// Dicas da API geradas pelas regras de negócio (50/30/20, reserva, horizontes).
import type { DashboardData } from "@/lib/dashboard";
import { formatBRL, type FixedExpense } from "@/lib/expenses";
import type { Insight, Part } from "@/lib/forecast";
import { configForMonth, monthKey, type ConfigVersion } from "@/lib/calcConfig";
import { monthsUntil, type DebtPlan, type SavingsPlan } from "@/lib/plans";
import {
  isContributingIn,
  levelLabel,
  pendingMilestone,
  reserveProgress,
  reserveStatus,
  type EmergencyReserve,
} from "@/lib/reserve";
import { evaluateBudget, fixedMonthlyTotal, horizonOf, HORIZON_LABEL, reserveRange } from "@/lib/rules";

const t = (text: string): Part => ({ text });
const b = (text: string): Part => ({ text, strong: true });
const months1 = (n: number) => n.toFixed(1).replace(".", ",");

export type RuleInput = {
  data: DashboardData;
  versions: ConfigVersion[];
  reserve: EmergencyReserve | null;
  savings: SavingsPlan[];
  debts: DebtPlan[];
  fixed: FixedExpense[];
  now?: Date;
};

/** Aportes do mês que contam como Investimento: reserva (se estiver aportando) + caixinhas em andamento. */
export function monthlyInvestmentContributions(
  reserve: EmergencyReserve | null,
  savings: SavingsPlan[],
  now = new Date(),
) {
  const month = monthKey(now);
  const firstDay = `${month}-01`;
  const fromReserve = reserve && isContributingIn(reserve, month) ? reserve.monthly : 0;
  const fromSavings = savings.filter((s) => s.targetDate >= firstDay).reduce((sum, s) => sum + s.monthly, 0);
  return Math.round((fromReserve + fromSavings) * 100) / 100;
}

export function buildRuleInsights(input: RuleInput): Insight[] {
  const now = input.now ?? new Date();
  const month = monthKey(now);
  const cfg = configForMonth(input.versions, month);
  const fixedMonthly = fixedMonthlyTotal(input.fixed, now.getFullYear(), now.getMonth());
  const { reserve } = input;
  const out: Insight[] = [];

  // 1) Meta da reserva concluída (aviso até o usuário dispensar)
  if (reserve && reserve.active) {
    const prog = reserveProgress(reserve, fixedMonthly, month);
    const done = pendingMilestone(reserve, prog);
    if (done) {
      const missing = prog.next && prog.nextAmount ? Math.max(0, prog.nextAmount - prog.saved) : null;
      out.push({
        id: "milestone",
        tone: "success",
        wide: true,
        title: "Meta da reserva concluída",
        badge: levelLabel(done),
        parts: [
          t("Parabéns! Sua reserva de emergência já cobre "),
          b(`${levelLabel(done)} das suas despesas fixas`),
          t(` (${formatBRL(prog.saved)} guardados).`),
          ...(prog.next
            ? [t(" O próximo marco é "), b(prog.next.label), t(missing !== null ? `: faltam ${formatBRL(missing)}.` : ".")]
            : [t(" Você concluiu todos os marcos da reserva!")]),
        ],
        footer: { icon: "check", text: "Marcos da reserva: 6 meses · 2 anos · 5 anos" },
        action: { key: "dismiss-milestone", label: "Entendi" },
      });
    }
  }

  // 2) Orçamento 50/30/20 do mês
  const extra = monthlyInvestmentContributions(reserve, input.savings, now);
  const budget = evaluateBudget({
    categories: input.data.categories,
    transactions: input.data.transactions,
    month,
    config: cfg,
    extraInvestment: extra,
  });
  if (budget) {
    const r = cfg.orcamento_regra_50_30_20;
    const parts: Part[] = [];
    budget.lines.forEach((l, i) => {
      if (i > 0) parts.push(t(" · "));
      parts.push(t(`${l.label} `), b(`${l.pct}%`), t(` (${l.kind} ${l.limitPct}%)`));
    });
    const worst = [...budget.deviations].sort((x, y) => y.gap - x.gap)[0];
    parts.push(t(". "));
    if (!worst) parts.push(t("Seu orçamento está dentro da regra neste mês."));
    else if (worst.group === "necessidade")
      parts.push(t("Seus gastos essenciais passaram "), b(formatBRL(worst.gap)), t(" do teto. Revise moradia, transporte e serviços."));
    else if (worst.group === "desejo")
      parts.push(t("Seus desejos passaram "), b(formatBRL(worst.gap)), t(" do teto. Vale reduzir lazer e compras."));
    else parts.push(t("Faltam "), b(formatBRL(worst.gap)), t(" para atingir o piso de investimento."));

    const n = budget.deviations.length;
    out.push({
      id: "budget",
      tone: n === 0 ? "success" : n === 1 ? "warning" : "danger",
      wide: true,
      title: `Orçamento ${r.necessidades_pct}/${r.desejos_pct}/${r.investimento_pct}`,
      badge: n === 0 ? "Dentro da regra" : n === 1 ? "1 alerta" : `${n} alertas`,
      parts,
      footer: {
        icon: "info",
        text: `Renda do mês: ${formatBRL(budget.income)}${extra > 0 ? ` · inclui ${formatBRL(extra)} de aportes (reserva e caixinhas)` : ""}`,
      },
    });
  }

  // 3) Situação da reserva frente à faixa recomendada
  if (reserve && reserve.active && fixedMonthly > 0) {
    const prog = reserveProgress(reserve, fixedMonthly, month);
    const status = reserveStatus(reserve, month);
    const range = reserveRange(fixedMonthly, cfg);
    const min = cfg.reserva_emergencia.meses_minimo;
    const max = cfg.reserva_emergencia.meses_maximo;
    const covered = prog.monthsCovered ?? 0;
    const tone = covered < min ? "warning" : covered > max ? "info" : "success";
    const badge = covered < min ? "Abaixo do mínimo" : covered > max ? "Acima do recomendado" : "Na meta";
    const parts: Part[] = [
      t("Sua reserva cobre "),
      b(`${months1(covered)} meses`),
      t(` das despesas fixas. O recomendado é de `),
      b(`${min} a ${max} meses`),
      t(` (${formatBRL(range.min)} a ${formatBRL(range.max)}).`),
    ];
    if (covered > max) parts.push(t(" O excedente pode ser direcionado a investimentos."));
    if (status === "paused") parts.push(t(" A reserva está pausada e não entra nos cálculos deste mês."));
    if (status === "pause-next-month") parts.push(t(" Ela será pausada a partir do próximo mês."));
    out.push({
      id: "reserve",
      tone,
      title: "Reserva de emergência",
      badge,
      parts,
      footer: { icon: "info", text: `Base: despesas fixas de ${formatBRL(fixedMonthly)}/mês` },
    });
  }

  // 4) Dívida com prazo além do curto prazo
  const longDebts = input.debts
    .map((d) => ({ d, months: monthsUntil(d.endDate, now) }))
    .filter((x) => horizonOf(x.months, cfg) !== "curto")
    .sort((x, y) => y.months - x.months);
  if (longDebts.length > 0) {
    const { d, months } = longDebts[0];
    const h = horizonOf(months, cfg);
    out.push({
      id: "horizon",
      tone: "warning",
      title: "Prazo da dívida",
      badge: HORIZON_LABEL[h],
      parts: [
        t("A dívida "),
        b(d.name),
        t(` será quitada em ${months} meses (${HORIZON_LABEL[h].toLowerCase()}). `),
        t(d.ratePct > 0 ? "Prazos mais longos acumulam mais juros; o ideal é quitar em curto prazo." : "Prazos mais longos mantêm a dívida aberta por mais tempo; o ideal é quitar em curto prazo."),
      ],
      footer: { icon: "calendar", text: `Curto prazo: até ${cfg.horizontes_temporais_meses.curto_prazo.max} meses` },
    });
  }

  return out;
}
