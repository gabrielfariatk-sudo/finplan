// Categorias padrão de cada conta, já classificadas para a regra 50/30/20.
// Elas nascem com a conta e NÃO podem ser apagadas nem trocar de grupo,
// porque a API usa esse agrupamento para avaliar o orçamento.
// Sem imports de ícones para poder ser usado também no servidor.
import type { CategoryGroup } from "@/lib/categoryGroups";

export const DEFAULT_CATEGORY_DATA: {
  name: string;
  icon: string;
  color: string;
  group: CategoryGroup;
}[] = [
  // Necessidades (gastos essenciais)
  { name: "Alimentação", icon: "utensils", color: "#a78bfa", group: "necessidade" },
  { name: "Transporte", icon: "car", color: "#7fa8f5", group: "necessidade" },
  { name: "Moradia", icon: "house", color: "#6fd6aa", group: "necessidade" },
  { name: "Saúde", icon: "heart", color: "#f593a8", group: "necessidade" },
  { name: "Educação", icon: "graduation", color: "#f5c677", group: "necessidade" },
  { name: "Serviços", icon: "settings", color: "#a3b1c9", group: "necessidade" }, // luz, água, internet, telefone
  { name: "Dívidas", icon: "database", color: "#97a3f2", group: "necessidade" }, // parcelas e obrigações
  // Desejos (gastos discricionários)
  { name: "Lazer", icon: "gamepad", color: "#76d4e0", group: "desejo" },
  { name: "Vestuário", icon: "shirt", color: "#ee98c8", group: "desejo" },
  { name: "Outros", icon: "ellipsis", color: "#b9c2d4", group: "desejo" },
  // Investimentos (poupança e patrimônio)
  { name: "Investimentos", icon: "trending", color: "#bde374", group: "investimento" },
];

export const normalizeName = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
