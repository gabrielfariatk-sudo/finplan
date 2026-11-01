export type FixedExpense = {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  duration: number | null; // meses; null = prazo indeterminado
  startIndex: number; // ano * 12 + mês em que começou
};

export type VariableExpense = {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  date: string; // "yyyy-mm-dd"
};

export const DURATIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export function periodIndex(year: number, month: number) {
  return year * 12 + month;
}

// O gasto fixo vale para o período selecionado?
export function isFixedActive(e: FixedExpense, year: number, month: number) {
  const idx = periodIndex(year, month);
  if (idx < e.startIndex) return false;
  return e.duration === null || idx < e.startIndex + e.duration;
}

// Aceita "1.500,50", "1500,50" ou "1500.50"
export function parseMoney(text: string): number | null {
  let s = text.replace(/[^\d,.-]/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function durationLabel(d: number | null) {
  if (d === null) return "Indeterminado";
  return d === 1 ? "1 mês" : `${d} meses`;
}

export function amountToInput(value: number) {
  return String(value).replace(".", ",");
}