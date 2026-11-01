import { parseMoney } from "@/lib/expenses";

export type SavingsPlan = {
  id: string;
  name: string;
  target: number; // valor da meta
  saved: number; // já guardado
  targetDate: string; // yyyy-mm-dd (evento ou resgate)
  monthly: number; // aporte mensal calculado
  months: number;
};
export type SavingsInput = Omit<SavingsPlan, "id">;

export type DebtPlan = {
  id: string;
  name: string;
  total: number; // valor total da dívida
  paid: number; // já pago
  endDate: string; // yyyy-mm-dd (data para quitar)
  ratePct: number; // juros ao mês (%), 0 se não informado
  monthly: number; // parcela mensal calculada
  months: number;
};
export type DebtInput = Omit<DebtPlan, "id">;

export type PlanPreview = {
  months: number;
  monthly: number;
  remaining: number; // quanto falta guardar / pagar
  interest: number; // juros estimados (só na dívida)
};

const DAY = 86_400_000;
const round2 = (n: number) => Math.round(n * 100) / 100;
const pad = (n: number) => String(n).padStart(2, "0");

export function todayIso(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function tomorrowIso(now = new Date()) {
  return todayIso(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
  );
}

// Meses entre hoje e a data (mínimo 1)
export function monthsUntil(dateIso: string, now = new Date()) {
  const [y, m, d] = dateIso.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((target.getTime() - start.getTime()) / DAY);
  return Math.max(1, Math.ceil(days / 30.4375));
}

// Campo opcional: vazio ou zero vira 0; texto inválido vira null
export function parseOptionalMoney(text: string): number | null {
  if (text.trim() === "") return 0;
  const n = parseMoney(text);
  if (n !== null) return n;
  return /^[\s0.,]*$/.test(text) ? 0 : null;
}

// Juros ao mês em %: vazio vira 0; aceita "2,5"
export function parseRate(text: string): number | null {
  if (text.trim() === "") return 0;
  const n = Number(text.replace(",", "."));
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
}

// TODO (API): trocar por uma chamada que devolva o valor mensal
export function previewSavings(
  target: number,
  saved: number,
  dateIso: string,
): PlanPreview {
  const months = monthsUntil(dateIso);
  const remaining = Math.max(0, target - saved);
  return {
    months,
    monthly: round2(remaining / months),
    remaining: round2(remaining),
    interest: 0,
  };
}

// TODO (API): trocar por uma chamada que devolva a parcela mensal
export function previewDebt(
  total: number,
  paid: number,
  ratePct: number,
  dateIso: string,
): PlanPreview {
  const months = monthsUntil(dateIso);
  const remaining = Math.max(0, total - paid);

  let monthly = remaining / months;
  if (ratePct > 0) {
    // Parcela fixa com juros compostos (tabela Price)
    const r = ratePct / 100;
    monthly = (remaining * r) / (1 - Math.pow(1 + r, -months));
  }

  return {
    months,
    monthly: round2(monthly),
    remaining: round2(remaining),
    interest: round2(Math.max(0, monthly * months - remaining)),
  };
}

export function progressPct(done: number, total: number) {
  return total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
}