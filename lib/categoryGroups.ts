// Os 3 grupos usados pela regra de orçamento (50/30/20). Sem imports de ícones.
export type CategoryGroup = "necessidade" | "desejo" | "investimento";

export const CATEGORY_GROUPS: {
  key: CategoryGroup;
  label: string; // singular
  plural: string;
  desc: string;
  badge: string; // classes do selo (fundo claro)
}[] = [
  { key: "necessidade", label: "Necessidade", plural: "Necessidades", desc: "Gastos essenciais: moradia, alimentação, saúde, transporte.", badge: "bg-sky-100 text-sky-800 border-sky-300" },
  { key: "desejo", label: "Desejo", plural: "Desejos", desc: "Estilo de vida: lazer, compras, extras.", badge: "bg-amber-100 text-amber-800 border-amber-300" },
  { key: "investimento", label: "Investimento", plural: "Investimentos", desc: "Poupança, reserva e patrimônio.", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" },
];

export const isCategoryGroup = (v: unknown): v is CategoryGroup =>
  v === "necessidade" || v === "desejo" || v === "investimento";

export const groupMeta = (g: CategoryGroup) => CATEGORY_GROUPS.find((x) => x.key === g)!;
