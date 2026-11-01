export type IncomeKind = "recurring" | "one-off";

export type Income = {
  id: string;
  kind: IncomeKind;
  owner: string;
  name: string;
  amount: number;
  start: string | null; // "yyyy-mm"
  end: string | null; // "yyyy-mm"
  notes: string;
};

export type IncomeInput = Omit<Income, "id">;

export const MONTHS_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonth(value: string) {
  const [y, m] = value.split("-");
  return `${MONTHS_SHORT[Number(m) - 1]}/${y}`;
}

export function periodLabel(i: Income) {
  if (i.kind === "one-off") return i.start ? formatMonth(i.start) : "—";
  if (i.start && i.end) return `${formatMonth(i.start)} - ${formatMonth(i.end)}`;
  if (i.start) return `A partir de ${formatMonth(i.start)}`;
  if (i.end) return `Até ${formatMonth(i.end)}`;
  return "Sem prazo";
}

// Renda encerrada: recorrente com término no passado, ou avulsa de um mês passado
export function isEnded(i: Income, current: string) {
  if (i.kind === "one-off") return i.start !== null && i.start < current;
  return i.end !== null && i.end < current;
}