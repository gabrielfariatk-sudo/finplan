// Base de Cálculo: os parâmetros que a API usa nas avaliações.
// Código puro (sem banco, sem React) para valer no servidor e no navegador.

export type CalcConfig = {
  orcamento_regra_50_30_20: {
    necessidades_pct: number; // percentuais SEMPRE inteiros (50 = 50%)
    desejos_pct: number;
    investimento_pct: number;
  };
  reserva_emergencia: {
    base_calculo: "despesas_fixas_mensais";
    meses_minimo: number;
    meses_maximo: number;
  };
  horizontes_temporais_meses: {
    curto_prazo: { min: number; max: number };
    medio_prazo: { min: number; max: number };
    longo_prazo: { min: number; max: null };
  };
};

export const DEFAULT_CALC_CONFIG: CalcConfig = {
  orcamento_regra_50_30_20: { necessidades_pct: 50, desejos_pct: 30, investimento_pct: 20 },
  reserva_emergencia: { base_calculo: "despesas_fixas_mensais", meses_minimo: 6, meses_maximo: 12 },
  horizontes_temporais_meses: {
    curto_prazo: { min: 0, max: 12 },
    medio_prazo: { min: 13, max: 60 },
    longo_prazo: { min: 61, max: null },
  },
};

/** Entrada simples (o que o formulário edita). Os limites mínimos dos horizontes são derivados. */
export type CalcConfigInput = {
  necessidades_pct: number;
  desejos_pct: number;
  investimento_pct: number;
  meses_minimo: number;
  meses_maximo: number;
  curto_max: number;
  medio_max: number;
};

export function configToInput(c: CalcConfig): CalcConfigInput {
  return {
    necessidades_pct: c.orcamento_regra_50_30_20.necessidades_pct,
    desejos_pct: c.orcamento_regra_50_30_20.desejos_pct,
    investimento_pct: c.orcamento_regra_50_30_20.investimento_pct,
    meses_minimo: c.reserva_emergencia.meses_minimo,
    meses_maximo: c.reserva_emergencia.meses_maximo,
    curto_max: c.horizontes_temporais_meses.curto_prazo.max,
    medio_max: c.horizontes_temporais_meses.medio_prazo.max,
  };
}

export function inputToConfig(i: CalcConfigInput): CalcConfig {
  return {
    orcamento_regra_50_30_20: {
      necessidades_pct: i.necessidades_pct,
      desejos_pct: i.desejos_pct,
      investimento_pct: i.investimento_pct,
    },
    reserva_emergencia: {
      base_calculo: "despesas_fixas_mensais",
      meses_minimo: i.meses_minimo,
      meses_maximo: i.meses_maximo,
    },
    horizontes_temporais_meses: {
      curto_prazo: { min: 0, max: i.curto_max },
      medio_prazo: { min: i.curto_max + 1, max: i.medio_max },
      longo_prazo: { min: i.medio_max + 1, max: null },
    },
  };
}

export const isWholeNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0;

/**
 * Valida o que chegou (do formulário ou da API).
 * Regra: só números INTEIROS (nada de 12,5%). Por enquanto não há outras restrições
 * de negócio: a soma dos percentuais não precisa fechar 100.
 */
export function validateCalcInput(
  raw: unknown,
): { ok: true; input: CalcConfigInput; config: CalcConfig } | { ok: false; error: string } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const fields: [keyof CalcConfigInput, string, number][] = [
    ["necessidades_pct", "Necessidades", 100],
    ["desejos_pct", "Desejos", 100],
    ["investimento_pct", "Poupança e Investimento", 100],
    ["meses_minimo", "Reserva (mínimo de meses)", 1200],
    ["meses_maximo", "Reserva (máximo de meses)", 1200],
    ["curto_max", "Curto prazo", 1200],
    ["medio_max", "Médio prazo", 1200],
  ];
  const out = {} as CalcConfigInput;
  for (const [key, label, max] of fields) {
    const v = r[key];
    if (!isWholeNumber(v)) return { ok: false, error: `${label}: use apenas números inteiros (sem vírgula ou ponto).` };
    if (v > max) return { ok: false, error: `${label}: o valor máximo é ${max}.` };
    out[key] = v;
  }
  return { ok: true, input: out, config: inputToConfig(out) };
}

// ---------- versões por mês ----------

export type ConfigVersion = { from: string | null; config: CalcConfig }; // from = "yyyy-mm"; null = desde sempre
export type ConfigScope = "all" | "next-month";

const pad = (n: number) => String(n).padStart(2, "0");
export const monthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const nextMonthKey = (d: Date) => monthKey(new Date(d.getFullYear(), d.getMonth() + 1, 1));
export const prevMonthKey = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 2, 1));
};

export const DEFAULT_VERSIONS: ConfigVersion[] = [{ from: null, config: DEFAULT_CALC_CONFIG }];

/** Config que vale em um mês: a versão mais recente cujo início é <= ao mês. */
export function configForMonth(versions: ConfigVersion[], month: string): CalcConfig {
  let found: ConfigVersion | null = null;
  for (const v of versions) {
    if (v.from === null || v.from <= month) {
      if (!found || (found.from ?? "") <= (v.from ?? "")) found = v;
    }
  }
  return (found ?? versions[0] ?? DEFAULT_VERSIONS[0]).config;
}

/** A versão mais nova (pode ser uma alteração agendada para o futuro). */
export function latestVersion(versions: ConfigVersion[]): ConfigVersion {
  return [...versions].sort((a, b) => (a.from ?? "").localeCompare(b.from ?? "")).at(-1) ?? DEFAULT_VERSIONS[0];
}

/** Alteração agendada (início depois do mês atual), se houver. */
export function pendingChange(versions: ConfigVersion[], now = new Date()): ConfigVersion | null {
  const cur = monthKey(now);
  return versions.find((v) => v.from !== null && v.from > cur) ?? null;
}

/**
 * all        -> os novos valores valem para TODAS as informações (histórico incluído)
 * next-month -> valem a partir do mês seguinte; até lá continuam os valores atuais
 */
export function applyConfigChange(
  versions: ConfigVersion[],
  config: CalcConfig,
  scope: ConfigScope,
  now = new Date(),
): ConfigVersion[] {
  if (scope === "all") return [{ from: null, config }];
  const next = nextMonthKey(now);
  const kept = versions.filter((v) => v.from === null || v.from < next);
  return [...kept, { from: next, config }];
}

export function cancelPending(versions: ConfigVersion[], now = new Date()): ConfigVersion[] {
  const cur = monthKey(now);
  const kept = versions.filter((v) => v.from === null || v.from <= cur);
  return kept.length ? kept : DEFAULT_VERSIONS;
}

export const sameConfig = (a: CalcConfig, b: CalcConfig) => JSON.stringify(a) === JSON.stringify(b);
