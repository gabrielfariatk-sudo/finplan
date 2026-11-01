import {
  buildDashboard,
  presetPeriod,
  type DashboardData,
} from "@/lib/dashboard";
import { formatBRL } from "@/lib/expenses";

export type Part = { text: string; strong?: boolean };
export type Tone = "danger" | "warning" | "purple" | "success" | "info";
export type FooterIcon = "info" | "calendar" | "target" | "check";

export type Insight = {
  id: "health" | "trend" | "top" | "savings" | "budget" | "reserve" | "milestone" | "horizon";
  tone: Tone;
  title: string;
  badge: string;
  parts: Part[];
  footer?: { icon: FooterIcon; text: string };
  wide?: boolean; // ocupa a linha inteira
  action?: { key: string; label: string }; // botão do cartão (ex.: dispensar aviso)
};

export type Recommendation = {
  badge: string;
  parts: Part[];
  footer: string;
};

export type Forecast = {
  baseIncome: number;
  insights: Insight[];
  recommendation: Recommendation | null;
};

// ---------- Caixinha ----------

export type PiggyGoal = {
  id: string;
  name: string;
  icon: "plane" | "shield";
  target: number;
  monthly: number;
  saved: number;
};

export function goalProgress(g: PiggyGoal) {
  return g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
}

// ---------- Insights ----------

const t = (text: string): Part => ({ text });
const b = (text: string): Part => ({ text, strong: true });
const pct = (v: number) => `${Math.round(v)}%`;

export function buildForecast(
  data: DashboardData,
  now = new Date(),
): Forecast {
  const month = buildDashboard(data, presetPeriod("month", now));
  const prev = buildDashboard(data, presetPeriod("last-month", now));
  const quarter = buildDashboard(data, presetPeriod("3m", now));
  const semester = buildDashboard(data, presetPeriod("6m", now));

  const insights: Insight[] = [];

  // Saúde financeira (comprometimento da renda)
  if (month.totalIncome > 0) {
    const rate = (month.totalExpense / month.totalIncome) * 100;
    const tone: Tone = rate >= 80 ? "danger" : rate >= 50 ? "warning" : "success";
    const badge = rate >= 80 ? "Atenção" : rate >= 50 ? "Moderado" : "Saudável";
    const lead =
      rate >= 80
        ? "Sua saúde financeira não está boa neste mês."
        : rate >= 50
          ? "Sua saúde financeira está em alerta neste mês."
          : "Sua saúde financeira está boa neste mês.";
    const advice =
      rate >= 80
        ? " Evite novas despesas não essenciais."
        : rate >= 50
          ? " Vale acompanhar de perto os gastos variáveis."
          : " Você está com folga no orçamento.";
    insights.push({
      id: "health",
      tone,
      title: "Saúde financeira",
      badge,
      parts: [
        t(`${lead} A taxa de comprometimento atingiu `),
        b(`${pct(rate)} da renda`),
        t(`.${advice}`),
      ],
      footer: { icon: "info", text: "Baseado na relação Receita x Despesa" },
    });
  }

  // Tendência de gastos (3 meses x 3 meses anteriores)
  if (quarter.deltaExpense !== null) {
    const d = quarter.deltaExpense;
    const up = d > 0;
    const last3 = quarter.trend.slice(-3);
    insights.push({
      id: "trend",
      tone: up ? "warning" : "success",
      title: "Tendência de gastos",
      badge: `${up ? "+" : "-"}${pct(Math.abs(d))}`,
      parts: [
        t(`Seus gastos ${up ? "subiram" : "caíram"} `),
        b(`${pct(Math.abs(d))} nos últimos 3 meses`),
        t(" em comparação com os 3 meses anteriores."),
      ],
      footer: {
        icon: "calendar",
        text: `Histórico: ${last3[0].label} a ${last3[last3.length - 1].label}`,
      },
    });
  }

  // Maior despesa
  const top = month.distribution[0];
  if (top) {
    const ofIncome =
      month.totalIncome > 0 ? (top.value / month.totalIncome) * 100 : null;
    insights.push({
      id: "top",
      tone: "purple",
      title: "Maior despesa",
      badge: ofIncome !== null ? `${pct(ofIncome)} Renda` : `${pct(top.pct)} Gastos`,
      parts:
        ofIncome !== null
          ? [
              t("Sua maior despesa neste mês é com "),
              b(top.name),
              t(" e compromete "),
              b(`${pct(ofIncome)} da sua renda do mês`),
              t("."),
            ]
          : [t("Sua maior despesa neste mês é com "), b(top.name), t(".")],
      footer: {
        icon: "target",
        text: `${pct(top.pct)} do total de gastos · ${formatBRL(top.value)}`,
      },
    });
  }

  // Economia identificada (categoria que mais caiu em relação ao mês anterior)
  let best: { name: string; change: number } | null = null;
  for (const d of month.distribution) {
    const p = prev.distribution.find((x) => x.id === d.id);
    if (!p || p.value <= 0) continue;
    const change = ((d.value - p.value) / p.value) * 100;
    if (change < -0.5 && (!best || change < best.change)) {
      best = { name: d.name, change };
    }
  }
  if (best) {
    insights.push({
      id: "savings",
      tone: "success",
      title: "Economia identificada",
      badge: `-${pct(Math.abs(best.change))}`,
      parts: [
        t("Você diminuiu o consumo com "),
        b(best.name),
        t(" em "),
        b(pct(Math.abs(best.change))),
        t(" neste mês. Excelente progresso!"),
      ],
      footer: { icon: "check", text: "Parabéns pelo hábito!" },
    });
  }

  // Recomendação: cortar 10% da maior categoria e levar para a Caixinha
  let recommendation: Recommendation | null = null;
  if (top) {
    const cut = Math.round(top.value * 0.1);
    if (cut > 0) {
      recommendation = {
        badge: "Otimização",
        parts: [
          t("Reduzindo apenas "),
          b(`${formatBRL(cut)}/mês`),
          t(` (10%) da categoria ${top.name} e direcionando para a sua Caixinha, você acumulará `),
          b(formatBRL(cut * 12)),
          t(" em 12 meses."),
        ],
        footer: "Simulação automática aplicada ao seu perfil",
      };
    }
  }

  return { baseIncome: semester.avgIncome, insights, recommendation };
}