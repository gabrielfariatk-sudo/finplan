// Reserva de Emergência. Código puro (servidor e navegador).
import { monthKey, nextMonthKey, prevMonthKey } from "@/lib/calcConfig";

export type ReserveLevel = "none" | "6m" | "2y" | "5y";

export const RESERVE_MILESTONES: { level: Exclude<ReserveLevel, "none">; months: number; label: string }[] = [
  { level: "6m", months: 6, label: "6 meses" },
  { level: "2y", months: 24, label: "2 anos" },
  { level: "5y", months: 60, label: "5 anos" },
];

export const LEVEL_OPTIONS: { level: ReserveLevel; label: string }[] = [
  { level: "none", label: "Não possuo nada" },
  { level: "6m", label: "6 meses" },
  { level: "2y", label: "2 anos" },
  { level: "5y", label: "5 anos" },
];

const RANK: Record<ReserveLevel, number> = { none: 0, "6m": 1, "2y": 2, "5y": 3 };
export const levelRank = (l: ReserveLevel) => RANK[l];
export const maxLevel = (a: ReserveLevel, b: ReserveLevel) => (RANK[a] >= RANK[b] ? a : b);
export const levelMonths = (l: ReserveLevel) => RESERVE_MILESTONES.find((m) => m.level === l)?.months ?? 0;
export const levelLabel = (l: ReserveLevel) => RESERVE_MILESTONES.find((m) => m.level === l)?.label ?? "nenhum marco";

/** Pausa: vale do mês `from` até `to` (inclusive). to = null -> pausa em aberto. */
export type Pause = { from: string; to: string | null };

export type EmergencyReserve = {
  id: string;
  active: boolean; // desativada = fora de todos os cálculos
  have: ReserveLevel; // quanto o usuário diz que JÁ possui
  baseSaved: number; // R$ guardados quando começou/continua
  startMonth: string; // "yyyy-mm" em que os aportes começam
  monthly: number; // aporte mensal (R$)
  pauses: Pause[];
  dismissed: ReserveLevel; // último marco cujo aviso já foi dispensado
};
export type ReserveInput = Omit<EmergencyReserve, "id">;

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const LEVELS = new Set<string>(["none", "6m", "2y", "5y"]);

export function validateReserve(raw: unknown): { ok: true; value: ReserveInput } | { ok: false; error: string } {
  const r = (raw ?? {}) as Record<string, unknown>;
  if (typeof r.active !== "boolean") return { ok: false, error: "Informe se a reserva está ativa." };
  if (typeof r.have !== "string" || !LEVELS.has(r.have)) return { ok: false, error: "Escolha quanto você já possui de reserva." };
  if (typeof r.dismissed !== "string" || !LEVELS.has(r.dismissed)) return { ok: false, error: "Marco inválido." };
  if (typeof r.baseSaved !== "number" || !Number.isFinite(r.baseSaved) || r.baseSaved < 0)
    return { ok: false, error: "Valor guardado inválido." };
  if (typeof r.monthly !== "number" || !Number.isFinite(r.monthly) || r.monthly < 0)
    return { ok: false, error: "Aporte mensal inválido." };
  if (typeof r.startMonth !== "string" || !MONTH_RE.test(r.startMonth))
    return { ok: false, error: "Informe o mês de início." };
  if (!Array.isArray(r.pauses) || r.pauses.length > 240) return { ok: false, error: "Pausas inválidas." };
  const pauses: Pause[] = [];
  for (const p of r.pauses as Record<string, unknown>[]) {
    const to = p?.to;
    if (typeof p?.from !== "string" || !MONTH_RE.test(p.from) || !(to === null || (typeof to === "string" && MONTH_RE.test(to))))
      return { ok: false, error: "Pausas inválidas." };
    pauses.push({ from: p.from, to: to as string | null });
  }
  return {
    ok: true,
    value: {
      active: r.active,
      have: r.have as ReserveLevel,
      baseSaved: Math.round(r.baseSaved * 100) / 100,
      startMonth: r.startMonth,
      monthly: Math.round(r.monthly * 100) / 100,
      pauses,
      dismissed: r.dismissed as ReserveLevel,
    },
  };
}

// ---------- estado em um mês ----------

const monthIndex = (key: string) => Number(key.slice(0, 4)) * 12 + Number(key.slice(5, 7)) - 1;
const keyOf = (i: number) => `${Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, "0")}`;

export const isPausedIn = (r: EmergencyReserve, month: string) =>
  r.pauses.some((p) => p.from <= month && (p.to === null || month <= p.to));

/** O aporte deste mês está valendo? (ativa, já começou e sem pausa) */
export const isContributingIn = (r: EmergencyReserve, month: string) =>
  r.active && r.startMonth <= month && !isPausedIn(r, month);

/**
 * Quantos aportes já foram CONCLUÍDOS: cada mês entra quando termina, então o mês atual
 * ainda não conta. Meses em pausa não contam.
 */
export function contributionMonths(r: EmergencyReserve, nowKey: string): number {
  let n = 0;
  for (let i = monthIndex(r.startMonth); i < monthIndex(nowKey); i++) if (!isPausedIn(r, keyOf(i))) n++;
  return n;
}

/** Valor guardado hoje = valor inicial + aportes dos meses já concluídos. */
export const reserveSavedNow = (r: EmergencyReserve, nowKey: string) =>
  Math.round((r.baseSaved + r.monthly * contributionMonths(r, nowKey)) * 100) / 100;

export type ReserveStatus = "inactive" | "scheduled" | "running" | "paused" | "pause-next-month";

export function reserveStatus(r: EmergencyReserve, nowKey: string): ReserveStatus {
  if (!r.active) return "inactive";
  if (isPausedIn(r, nowKey)) return "paused";
  if (r.startMonth > nowKey) return "scheduled";
  if (r.pauses.some((p) => p.from > nowKey && p.to === null)) return "pause-next-month";
  return "running";
}

export type ReserveProgress = {
  saved: number;
  fixedMonthly: number;
  monthsCovered: number | null; // null = sem gastos fixos para comparar
  achieved: ReserveLevel; // maior marco concluído
  next: (typeof RESERVE_MILESTONES)[number] | null; // próximo marco
  nextAmount: number | null; // R$ do próximo marco
  pct: number; // 0-100 rumo ao próximo marco
};

export function reserveProgress(r: EmergencyReserve, fixedMonthly: number, nowKey: string): ReserveProgress {
  const saved = reserveSavedNow(r, nowKey);
  const monthsCovered = fixedMonthly > 0 ? saved / fixedMonthly : null;
  let achieved: ReserveLevel = r.have;
  if (monthsCovered !== null) {
    for (const m of RESERVE_MILESTONES) if (monthsCovered >= m.months) achieved = maxLevel(achieved, m.level);
  }
  const next = RESERVE_MILESTONES.find((m) => levelRank(m.level) > levelRank(achieved)) ?? null;
  const nextAmount = next && fixedMonthly > 0 ? Math.round(next.months * fixedMonthly * 100) / 100 : null;
  const pct = nextAmount ? Math.min(100, Math.floor((saved / nextAmount) * 100)) : next ? 0 : 100;
  return { saved, fixedMonthly, monthsCovered, achieved, next, nextAmount, pct };
}

/** Marco concluído cujo aviso ainda não foi dispensado (ou null). */
export function pendingMilestone(r: EmergencyReserve, p: ReserveProgress): ReserveLevel | null {
  return r.active && levelRank(p.achieved) > levelRank(r.dismissed) ? p.achieved : null;
}

// ---------- pausar / retomar ----------

/** Pausa a partir do mês seguinte (este mês ainda recebe o aporte). */
export function pauseFromNextMonth(r: EmergencyReserve, now = new Date()): Pause[] {
  if (r.pauses.some((p) => p.to === null)) return r.pauses;
  return [...r.pauses, { from: nextMonthKey(now), to: null }];
}

/** Retoma neste mês. Se a pausa ainda nem começou, ela é só cancelada. */
export function resumeNow(r: EmergencyReserve, now = new Date()): Pause[] {
  const cur = monthKey(now);
  return r.pauses.flatMap((p): Pause[] => {
    if (p.to !== null && p.to < cur) return [p]; // pausa antiga e já encerrada
    if (p.to !== null && p.from > cur) return []; // pausa futura com fim: cancela
    if (p.from > cur) return []; // pausa agendada em aberto: cancela
    const to = p.to === null || p.to >= cur ? prevMonthKey(cur) : p.to;
    return to < p.from ? [] : [{ from: p.from, to }]; // pausou neste mês e voltou: nada a descontar
  });
}
